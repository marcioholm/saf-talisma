import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are not set');
}

// Cliente público (browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente servidor (service role)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Funções auxiliares para Posts
export const posts = {
  async getAll(limit = 10, offset = 0) {
    const { data, error, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .order('data_publicacao', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  },

  async getFeatured(limit = 3) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('destaque', true)
      .order('data_publicacao', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getByCategory(category: string, limit = 10, offset = 0) {
    const { data, error, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('categoria', category)
      .order('data_publicacao', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  async create(post: any) {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert([post])
      .select();

    if (error) throw error;
    return data[0];
  },

  async update(id: string, post: any) {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .update(post)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Funções auxiliares para Sponsors
export const sponsors = {
  async getAll() {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('ordem', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .eq('categoria', category)
      .order('ordem', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getFeatured() {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .eq('destaque', true)
      .order('ordem', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(sponsor: any) {
    const { data, error } = await supabaseAdmin
      .from('sponsors')
      .insert([sponsor])
      .select();

    if (error) throw error;
    return data[0];
  },

  async update(id: string, sponsor: any) {
    const { data, error } = await supabaseAdmin
      .from('sponsors')
      .update(sponsor)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('sponsors')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Funções auxiliares para Newsletter
export const newsletter = {
  async subscribe(email: string) {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email, ativo: true }])
      .select();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Este email já está inscrito');
      }
      throw error;
    }
    return data[0];
  },

  async unsubscribe(email: string) {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ ativo: false })
      .eq('email', email);

    if (error) throw error;
  },

  async getSubscribers() {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('ativo', true);

    if (error) throw error;
    return data;
  },
};

// Funções auxiliares para Resultados
export const resultados = {
  async getAll(limit = 10, offset = 0) {
    const { data, error, count } = await supabase
      .from('resultados')
      .select('*', { count: 'exact' })
      .order('data_jogo', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  },

  async getByCategory(category: string, limit = 10, offset = 0) {
    const { data, error, count } = await supabase
      .from('resultados')
      .select('*', { count: 'exact' })
      .eq('categoria', category)
      .order('data_jogo', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  },

  async getRecent(limit = 5) {
    const { data, error } = await supabase
      .from('resultados')
      .select('*')
      .order('data_jogo', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async create(resultado: any) {
    const { data, error } = await supabaseAdmin
      .from('resultados')
      .insert([resultado])
      .select();

    if (error) throw error;
    return data[0];
  },

  async update(id: string, resultado: any) {
    const { data, error } = await supabaseAdmin
      .from('resultados')
      .update(resultado)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('resultados')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Funções auxiliares para Estatísticas
export const estatisticas = {
  async get() {
    const { data, error } = await supabase
      .from('estatisticas')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async update(stats: any) {
    const { data, error } = await supabaseAdmin
      .from('estatisticas')
      .update(stats)
      .select();

    if (error) throw error;
    return data[0];
  },
};
