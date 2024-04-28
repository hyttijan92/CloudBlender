import {sql} from '../database/database.js';

const insertIntoBlenderSubmission = async(user_uuid,input_file) =>{
    const result = await sql`INSERT INTO BLENDER_SUBMISSION(user_uuid,input_file) VALUES(${user_uuid,input_file}) RETURNING *`;
    return (result && result.length > 0) ? result[0] : null;
}
const selectFromBlenderSubmissionsById = async(id) =>{
    
    const result = await sql`SELECT * FROM BLENDER_SUBMISSION WHERE id = ${id}`;
    return (result && result.length > 0) ? result[0] : null;
}
const updateBlenderSubmissionWithOutput = async(id,output_file,status) =>{
    await sql`UPDATE BLENDER_SUBMISSION SET output_file=${output_file},status =${status} WHERE id = ${id};`;
}
export {selectFromBlenderSubmissionsById,insertIntoBlenderSubmission,updateBlenderSubmissionWithOutput}
