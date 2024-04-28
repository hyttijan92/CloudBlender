<script>
    import { userUuid } from "../stores/stores.js";
    import SuccessText from "./texts/SuccessText.svelte";
    import ErrorText from "./texts/ErrorText.svelte";
    import {validateFileExtension, validateFrames} from '../utils/utilFunctions.js';
    
    let uploading = false;
    let fileToBeUploaded = {
        startFrame: 0,
        endFrame: 0,
        engine: "CYCLES",
        file: null,
    }
    let successMessage = null;
    let errorMessage = null;
    $: disabledSubmit = !fileToBeUploaded.file || uploading;
    
    const initFileToBeUploaded = ()=>{
        return({
        startFrame: 0,
        endFrame: 0,
        engine: "CYCLES",
        file: null,
        });
    }
    
    const onDropFile = async (event) => {
        event.preventDefault();
        if (event.dataTransfer) {
            if (validateFileExtension(event.dataTransfer.files[0])){
                fileToBeUploaded.file = event.dataTransfer.files[0];
            }
            else{
                showErrorMessage("File extension is not valid.");
            }      
        }
    };

    const onUploadFile = async (event) => {
        event.preventDefault();
        if (event.target) {
            fileToBeUploaded.file = event.target.files[0];
        }
    };

    const submitFile = async () => {
        const validFileExtension = validateFileExtension(fileToBeUploaded.file);
        const validFrames = validateFrames(fileToBeUploaded.startFrame,fileToBeUploaded.endFrame);
        if(!validFileExtension || !validFrames){
            let message = "";
            message += !validFileExtension ? "File extension is not valid. " : "";
            message += !validFrames ? "Start and end frames are not valid. Start frame must be less or equal to end frame" : "";
            showErrorMessage(message);
        }
        else {
            uploading = true;      
            try{      
                const formData = new FormData();
                formData.append("blender_file", fileToBeUploaded.file);
                formData.append("start_frame", fileToBeUploaded.startFrame);
                formData.append("end_frame", fileToBeUploaded.endFrame);
                formData.append("engine", fileToBeUploaded.engine);
                const response = await fetch("/api/upload", {
                    method: "POST",
                    headers: {
                        userid: $userUuid,
                    },
                    body: formData,
                });
                await response.json();
                showSuccessMessage("File uploaded succesfully");
            }
            catch(e){
                showErrorMessage("Something went wrong during file upload");
            }
            fileToBeUploaded = initFileToBeUploaded();
            uploading = false;
        }
        
    };
    const showSuccessMessage = (message) =>{
        successMessage = message;
        setTimeout(() => successMessage = null,3000);
    }
    const showErrorMessage = (message) =>{
        errorMessage = message;
        setTimeout(() => errorMessage = null,3000);
    }
</script>

<div class={"mx-auto mt-10"}>
    <h1 class={"text-4xl"}>Upload your blender file</h1>
    <div on:dragover={(event) => event.preventDefault()} on:drop={onDropFile}>
        <label
            class={"flex w-full cursor-pointer appearance-none items-center justify-center rounded-md border-2 border-dashed border-gray-200 p-6 transition-all hover:border-primary-300"}
        >
            <div class="space-y-1 text-center">
                {#if fileToBeUploaded.file}
                    <p class="text-sm text-gray-500">
                        File selected: {fileToBeUploaded.file.name}
                    </p>
                {:else}
                    <div
                        class="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="h-6 w-6 text-gray-500"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                            />
                        </svg>
                    </div>
                    <div class="text-gray-600">
                        <a
                            href="#"
                            class="font-medium text-primary-500 hover:text-primary-700"
                            >Click to upload</a
                        > or drag and drop
                    </div>
                    <p class="text-sm text-gray-500">
                        Drop your blend file here
                    </p>
                {/if}
            </div>
            <input
                id="blenderFile"
                type="file"
                accept=".blend"
                on:input={onUploadFile}
                class="sr-only"
            />
        </label>
    </div>
    <div class={`bg-gray-100 m-4 p-4 rounded`}>
        
        <label for="start_frame">Start frame</label>
        <input 
            id="start_frame"
            bind:value={fileToBeUploaded.startFrame}
            min={0}
            max={200}
            class={`border-2 ${!validateFrames(fileToBeUploaded.startFrame,fileToBeUploaded.endFrame) ? "border-red-200" : ""}`}
            type="number" 
        />
        <label for="end_frame">End frame</label>
        <input
            id="end_frame"
            class={`border-2 ${!validateFrames(fileToBeUploaded.startFrame,fileToBeUploaded.endFrame) ? "border-red-200" : ""}`}
            bind:value={fileToBeUploaded.endFrame}
            min={0}
            max={200}
            type="number"
        />
        <label for="engine">Engine</label>
        <select id="engine" bind:value={fileToBeUploaded.engine} name="engine">
            <option value="CYCLES">Cycles</option>
        </select>
    </div>
    <button
        class={`bg-blue-500 text-white font-bold p-4 rounded m-4 disabled:opacity-50 ${
            disabledSubmit ? "" : "hover:bg-blue-700"
        }`}
        on:click={submitFile}
        disabled={disabledSubmit}
        >Submit file
    </button>
    {#if successMessage}
    <SuccessText text={successMessage}/>
    {/if}
    {#if errorMessage}
    <ErrorText text={errorMessage}/>
    {/if}
</div>
