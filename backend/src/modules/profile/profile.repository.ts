import { supabase } from '../../config/supabaseClient';

export class ProfileRepository {
    async getById(id: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'no rows found'
        return data;
    }

    async getByUsername(username: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async update(id: string, updateData: any) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async create(profileData: any) {
        console.log(`[ProfileRepository] Inserting profile data:`, profileData);
        const { data, error } = await supabase
            .from('profiles')
            .insert([profileData])
            .select()
            .single();

        if (error) {
            console.error(`[ProfileRepository] Error creating profile:`, error);
            throw error;
        }
        return data;
    }

    async searchProfiles(query: string) {
        console.log(`[ProfileRepo] Searching profiles with query: "${query}"`);
        const { data, error } = await supabase
            .rpc('search_profiles', { search_query: query });

        if (error) {
            console.error('[ProfileRepo] Error searching profiles:', error);
            return [];
        }
        console.log(`[ProfileRepo] Found ${data?.length} profiles`);
        return data || [];
    }
    async delete(id: string) {
        // This will only delete from the 'profiles' table.
        // User deletion from Supabase Auth should be handled separately or via triggers/cascades.
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
