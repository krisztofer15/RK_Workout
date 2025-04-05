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

export const updateUser = async (userId, data, refreshUser) => {
    try {
      // 1. Users tábla frissítés
      const { error: userError } = await supabase
        .from('users')
        .update(data)
        .eq('id', userId);
  
      if (userError) {
        console.log('Error updating user: ', userError);
        return { success: false, msg: userError.message };
      }
  
      // 2. Auth metadata frissítés
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
        return { success: false, msg: authError.message };
      }
  
      // 3. Session frissítés
      await supabase.auth.refreshSession();
  
      // 4. 👉 FELHASZNÁLÓ FRISSÍTÉSE AZONNAL CONTEXTBEN!
      if (refreshUser) {
        await refreshUser(); // ez fontos
      }
  
      return { success: true };
    } catch (error) {
      console.log('Unexpected error: ', error);
      return { success: false, msg: error.message };
    }
  }
  