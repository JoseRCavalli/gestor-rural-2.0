
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { 
      user_id, 
      title, 
      message, 
      type = 'info', 
      channel = 'app' 
    } = await req.json()

    if (!user_id || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user notification settings
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (settingsError) {
      console.error('Error getting notification settings:', settingsError)
    }

    // Check if user wants this type of notification
    let shouldSend = true
    if (settings) {
      if (type === 'weather' && !settings.weather_alerts) shouldSend = false
      if (type === 'stock' && !settings.stock_alerts) shouldSend = false
      if (channel === 'whatsapp' && !settings.whatsapp_notifications) shouldSend = false
      if (channel === 'email' && !settings.email_notifications) shouldSend = false
    }

    if (!shouldSend) {
      return new Response(
        JSON.stringify({ message: 'Notification blocked by user settings' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create notification in database
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id,
        title,
        message,
        type,
        channel,
        sent_at: new Date().toISOString()
      })
      .select()
      .single()

    if (notificationError) {
      console.error('Error creating notification:', notificationError)
      return new Response(
        JSON.stringify({ error: 'Failed to create notification' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Notification sent successfully:', notification)

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification,
        message: 'Notification sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in send-notification function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
