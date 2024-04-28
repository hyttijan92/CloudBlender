import {sql} from '../database/database.js';

const insertIntoBlenderSubmission = async(user_uuid,file_name,start_frame,end_frame,engine,input_file) =>{
    const result = await sql`INSERT INTO BLENDER_SUBMISSION(user_uuid,input_file_name,start_frame,end_frame,engine,input_file) VALUES(${user_uuid},${file_name},${start_frame},${end_frame},${engine}, ${input_file}) RETURNING id, user_uuid, input_file_name, status;`;
    return (result && result.length > 0) ? result[0] : null;
}
const selectFromBlenderSubmissionsById = async(id) =>{
    const result = await sql`SELECT * FROM BLENDER_SUBMISSION WHERE id = ${id};`;
    return (result && result.length > 0) ? result[0] : null;
}
const selectFromBlenderSubmissionsByUserUUID = async(user_uuid) =>{
    const result = await sql`SELECT id,input_file_name, start_frame, end_frame, engine, status FROM BLENDER_SUBMISSION WHERE user_uuid = ${user_uuid} ORDER BY id DESC;`;
    return result;
}
export {selectFromBlenderSubmissionsById,insertIntoBlenderSubmission,selectFromBlenderSubmissionsByUserUUID}