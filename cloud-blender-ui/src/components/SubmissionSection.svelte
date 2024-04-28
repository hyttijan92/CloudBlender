<script>
  import {onMount} from 'svelte';
  import { userUuid } from "../stores/stores.js";
    import Spinner from './icons/Spinner.svelte';
    import ErrorIcon from './icons/ErrorIcon.svelte';
    import FileUpload from './FileUpload.svelte';
    import InfoText from './texts/InfoText.svelte';

    let submissions = [];
    let infoMessage = null;

    const pollSubmissions = async() =>{
      try{
        const response = await fetch('/api/poll',{
          method: 'GET',
          headers: {
                  userid: $userUuid,
          }
        })
        const responseJSON = await response.json();
        submissions = responseJSON.submissions; 
      }
      catch(e){
        submissions = [];
        showInfoText("Could not fetch submissions from the server");
      }
    }
    const showInfoText = (message) =>{
        infoMessage = message;
        setTimeout(() => infoMessage = null,3000);
    }
    onMount(pollSubmissions)
    setInterval(pollSubmissions,5000);
</script>
<FileUpload/>
<h2 class={"text-2xl"}>Previous submissions</h2>
<div class="rounded shadow-md bg-gray-200 border-solid border-2 border-indigo-400 m-1 break-all grid grid-cols-6">
  <div>ID</div> <div>INPUT FILE NAME</div><div>Frames</div><div>Engine</div><div>STATUS</div><div></div>
</div>
{#each submissions as submission}
<div class="rounded shadow-md bg-blue-200 border-solid border-2 border-indigo-400 m-1 break-all grid grid-cols-6">
  <div>{submission.id}</div> <div>{submission.input_file_name}</div><div>{submission.start_frame} - {submission.end_frame}</div> <div>{submission.engine}</div><div>{submission.status}</div>
    {#if submission.status === 'processed'}
     <a href="/api/download/{submission.id}"> 
        <button 
          class={'bg-green-500 text-white p-1 rounded m-1'} 
        >
        Download
      </button>
    </a>
    {:else if submission.status ==='failed'}
    <ErrorIcon/>
    {:else}
    <Spinner/>
    {/if}
  </div>
{/each}
{#if infoMessage}
<InfoText text={infoMessage}/>
{/if}