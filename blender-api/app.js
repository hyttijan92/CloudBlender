import { createClient, commandOptions } from "./deps.js";
import * as blenderSubmissionService from "./services/blenderSubmissionService.js";
import {render} from "./services/blenderRenderingService.js";
const queueProcessor = createClient({
  url: "redis://redis:6379",
  pingInterval: 1000
})
await queueProcessor.connect();

const processQueue = async() => {
  const brPopPromise = await queueProcessor.brPop("rendering-queue",1);
  const item = await brPopPromise;
  if(item !== null){
    console.log("Processing render");
    let submission = JSON.parse(item.element);
    submission =  await blenderSubmissionService.selectFromBlenderSubmissionsById(submission.id);
    console.log("render file fetched:", submission.input_file_name)
    try{
      const result = await render(submission);
      await blenderSubmissionService.updateBlenderSubmissionWithOutput(submission.id,result,'processed')
    }
    catch(e){
      console.log("Error:",e);
      await blenderSubmissionService.updateBlenderSubmissionWithOutput(submission.id,null,'failed')
     
    }
  }
  setTimeout(() => processQueue(),0);
}
processQueue()
