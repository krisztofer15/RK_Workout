import { supabase } from "../lib/supabase";

export const getUserData = async (userId) => {
    try {
        const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', userId)
        .single();
        if(error) {
            return {success: false, msg: error?.message};
        }
        return {succes: true, data};
    } catch(error) {
        console.log('got error: ', error);
        return {success: false, msg: error.message};
    }
}

export const updateUser = async (userId, data) => {
    try {
        // Supabase users tábla frissítése
        const { error: userError } = await supabase
            .from('users')
            .update(data)
            .eq('id', userId);

        if (userError) {
            console.log('Error updating user: ', userError);
            return {success: false, msg: userError.message};
        }

        // Supabase auth metadata frissítése
        const { error: authError } = await supabase.auth.updateUser({
            data: {
                name: data.name,
                image: data.image,
                bio: data.bio,
                address: data.address,
                phoneNumber: data.phoneNumber
            }
        });

        if (authError) {
            console.log('Error updating auth metadata: ', authError);
            return {success: false, msg: authError.message};
        }
        await refreshUser();

        return {success: true};
    } catch (error) {
        console.log('Unexpected error: ', error);
        return {success: false, msg: error.message};
    }
}