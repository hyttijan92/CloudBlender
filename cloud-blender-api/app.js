import { serve,createClient,toStream } from './deps.js';

import * as blenderSubmissionService from './services/blenderSubmissionService.js';

const producer = createClient({
    url: "redis://redis:6379",
    pingInterval: 1000,
  });
await producer.connect();


const handleRequest = async (request) => {
    const mapping = urlMapping.find(
        (um) => um.method === request.method && um.pattern.test(request.url)
    );
    if(!mapping){
        return new Response("Not found", { status: 404 });
    }
    const mappingResult = mapping.pattern.exec(request.url);
    return await mapping.fn(request,mappingResult);
}
const handleBlenderFileUpload = async(request) =>{
    try{
        const user_uuid = request.headers.get("userid")
        const request_body = await request.formData();
        const file = request_body.get("blender_file");
        const start_frame = request_body.get("start_frame");
        const end_frame = request_body.get("end_frame")
        const engine = request_body.get("engine");
        const response = await blenderSubmissionService.insertIntoBlenderSubmission(user_uuid,file.name,start_frame,end_frame,engine,await file.arrayBuffer());
        await producer.lPush("rendering-queue", JSON.stringify(response));
        return Response.json({submission: response});
    }
    catch(e){
        console.log("Error:",e);
        return new Response("Bad request",{status: 400});
    }
}
const handlePolling = async(request) =>{
    try{
        const user_uuid = request.headers.get("userid")
        const result = await blenderSubmissionService.selectFromBlenderSubmissionsByUserUUID(user_uuid);
        return Response.json({submissions: result});
    }
    catch(e){
        console.log("Error:",e);
        return new Response("Bad request",{status: 400});
    }
}
const handleDownload = async(request,urlPatternResult) =>{
    try{
    
        const id = urlPatternResult.pathname.groups.id;
        const submission = await blenderSubmissionService.selectFromBlenderSubmissionsById(id);
        const output_file = submission.output_file;
        await Deno.writeFile(`${id}.zip`, new Uint8Array(output_file),{ mode: 0o644 })
        let file = await Deno.open(`${id}.zip`,{read: true});
        const headers = new Headers();
        const stats = await Deno.lstat(`${id}.zip`);
        const contentLength = stats.size;
        headers.set("Content-length", `${contentLength}`);
        await Deno.remove(`${id}.zip`)
        return new Response(toStream(file),{
            headers,
            status: 200
        });
    }
    catch(e){
        console.log("Error:",e);
        return new Response("Bad request",{status: 400}); 
    }
    
    
}
const urlMapping = [
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/upload" }),
        fn: handleBlenderFileUpload,
    },
    {
        method: "GET",
        pattern: new URLPattern({pathname: "/poll"}),
        fn: handlePolling
    },
    {
        method: "GET",
        pattern: new URLPattern({pathname: "/download/:id"}),
        fn: handleDownload
    }
]

const portConfig = { port: 7777, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);
