
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
      report_type,
      title,
      period = 30 // days
    } = await req.json()

    if (!user_id || !report_type || !title) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    let reportData: any = {}

    if (report_type === 'stock') {
      // Generate stock report
      const { data: stockItems } = await supabase
        .from('stock_items')
        .select('*')
        .eq('user_id', user_id)

      const lowStockItems = stockItems?.filter(item => item.quantity <= item.min_stock) || []
      const totalItems = stockItems?.length || 0
      const totalValue = stockItems?.reduce((sum, item) => sum + (item.quantity * 10), 0) || 0 // Assuming average cost of 10

      reportData = {
        period: `${period} dias`,
        totalItems,
        lowStockItems: lowStockItems.length,
        totalValue,
        items: stockItems?.map(item => ({
          name: item.name,
          quantity: item.quantity,
          min_stock: item.min_stock,
          status: item.quantity <= item.min_stock ? 'Baixo' : 'OK',
          category: item.category
        }))
      }
    } else if (report_type === 'events') {
      // Generate events report
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user_id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])

      reportData = {
        period: `${period} dias`,
        totalEvents: events?.length || 0,
        eventsByType: events?.reduce((acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        events: events?.map(event => ({
          title: event.title,
          date: event.date,
          time: event.time,
          type: event.type,
          description: event.description
        }))
      }
    } else if (report_type === 'financial') {
      // Generate basic financial report
      reportData = {
        period: `${period} dias`,
        summary: 'Relatório financeiro básico gerado automaticamente',
        note: 'Integre com seu sistema de gestão financeira para dados detalhados'
      }
    }

    // Save report to database
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert({
        user_id,
        report_type,
        title,
        data: reportData
      })
      .select()
      .single()

    if (reportError) {
      console.error('Error saving report:', reportError)
      return new Response(
        JSON.stringify({ error: 'Failed to save report' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Report generated successfully:', report)

    return new Response(
      JSON.stringify({ 
        success: true, 
        report,
        message: 'Report generated successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in generate-report function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
