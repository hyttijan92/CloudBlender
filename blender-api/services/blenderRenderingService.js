const run = async (cmdList) => {
  const process = Deno.run({ cmd: cmdList });
  await process.status();
};

const createRenderingContainer = async (input_file, randomKey) => {
  const renderFileName = `render_file_${randomKey}.blend`;
  await Deno.writeFile(renderFileName, new Uint8Array(input_file), { mode: 0o644 });
  const renderContainerImageName = `render-image-${randomKey}`;
  const tmpRenderContainerName = `${renderContainerImageName}-tmp`;
  console.log(`Let's create a temporary container ${tmpRenderContainerName}`)
  await run([
    "docker",
    "create",
    "--name",
    tmpRenderContainerName,
    "render-image",
  ]);
  console.log(`Copy Blend file ${renderFileName} to  temporary container ${tmpRenderContainerName}`)
  await run([
    "docker",
    "cp",
    renderFileName,
    `${tmpRenderContainerName}:/app/blender_file.blend`,
  ]);
  console.log("Commit changes from temporary container to create new image that is used for rendering")
  await run(["docker", "commit", tmpRenderContainerName, renderContainerImageName]);
  console.log("Remove temporary container")
  await run(["docker", "rm", "-fv", tmpRenderContainerName]);

  await Deno.remove(renderFileName);

  return renderContainerImageName;
};

const runRenderingContainer = async (renderContainerImageName, start_frame, end_frame, randomKey) => {
  console.log("Run container(render)")
  await run([
    "docker",
    "run",
    "--name",
    `${renderContainerImageName}-container`,
    renderContainerImageName,
    start_frame,
    end_frame
  ]);
  console.log("Copy rendered images from container")
  await run([
    "docker",
    "cp",
    `${renderContainerImageName}-container:/app/images.zip`,
    `images-${randomKey}.zip`,
  ]);
  console.log("remove rendering image")
  await run(["docker", "image", "rm", "-f", `${renderContainerImageName}`]);
  console.log("remove rendering container")
  await run(["docker", "rm", "-fv", `${renderContainerImageName}-container`]);

  const zipFile = await Deno.readFile(`images-${randomKey}.zip`);

  await Deno.remove(`images-${randomKey}.zip`);

  return zipFile;
};

const render = async (submission) => {

  const randomKey = Math.floor(Math.random() * 900000000 + 100000000);
  console.log("Start creating render container")
  const renderContainerImageName = await createRenderingContainer(
    submission.input_file,
    randomKey
  );
  console.log("Run render container")
  const result = await runRenderingContainer(renderContainerImageName, submission.start_frame, submission.end_frame, randomKey);

  return result;
};

export { render };
