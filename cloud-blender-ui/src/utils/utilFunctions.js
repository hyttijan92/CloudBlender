export const validateFileExtension = (file) =>{
    return file.name.split('.').pop() === 'blend';
}
export const validateFrames = (start_frame,end_frame) =>{
    return (typeof start_frame === 'number' &&
            typeof end_frame === 'number' &&
            end_frame >= start_frame &&
            start_frame >= 0)
}
