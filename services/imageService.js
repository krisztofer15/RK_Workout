import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { supabaseUrl } from '../constants';

export const getUserImageSrc = imagePath => {
    if(imagePath) {
        return getSupabaseFileUrl(imagePath);
    }else {
        return require("../assets/images/profilePic.webp")
    }
}

export const getSupabaseFileUrl = filePath => {
    if(filePath) {
        
        return {uri: `${supabaseUrl}/storage/v1/object/public/${filePath}`}
    }
    return null;
}

export const uploadFile = async (folderName, fileUri, isImage = true) => {
    try {
        let fileName = getFilePath(folderName, isImage);
        const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64
        });
        let imageData = decode(fileBase64);

        const { data, error } = await supabase
            .storage
            .from('uploads')
            .upload(fileName, imageData, {
                cacheControl: '3600',
                upsert: false,
                contentType: isImage ? 'image/png' : 'video/mp4'
            });

        if (error) {
            return { success: false, msg: 'Could not upload media' };
        }

        // ✅ Return the uploaded file path here before exiting the try block
        return { success: true, data: data.fullPath }; 

    } catch (error) {
        console.log('file upload error: ', error);
        return { success: false, msg: 'Could not upload media' };
    }
};


export const getFilePath = (folderName, isImage) => {
    return `/${folderName}/${(new Date()).getTime()}${isImage? '.png' : '.mp4'}`;
}