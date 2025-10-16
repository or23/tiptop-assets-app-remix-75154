import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment variables with validation
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const OPENAI_ASSISTANT_ID = Deno.env.get('OPENAI_ASSISTANT_ID');

console.log('🚀 [STARTUP] Environment check:', {
  hasOpenAIKey: !!OPENAI_API_KEY,
  hasSupabaseUrl: !!SUPABASE_URL,
  hasServiceRole: !!SUPABASE_SERVICE_ROLE_KEY,
  hasAssistantId: !!OPENAI_ASSISTANT_ID,
  assistantId: OPENAI_ASSISTANT_ID ? `${OPENAI_ASSISTANT_ID.substring(0, 8)}...` : 'missing'
});

serve(async (req): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🔄 [${requestId}] ${req.method} ${req.url}`);

  try {
    // Enhanced environment validation
    const validationResult = validateEnvironment(requestId);
    if (!validationResult.success) {
      console.error(`❌ [${requestId}] Environment validation failed:`, validationResult.error);
      return errorResponse(validationResult.error || 'Environment validation failed', 500, requestId);
    }

    // Parse request body with better error handling
    let requestBody;
    try {
      const rawBody = await req.text();
      console.log(`📥 [${requestId}] Raw request body:`, rawBody);
      requestBody = JSON.parse(rawBody);
    } catch (error) {
      console.error(`❌ [${requestId}] JSON parsing failed:`, error instanceof Error ? error.message : String(error));
      return errorResponse('Invalid JSON in request body', 400, requestId);
    }

    if (!requestBody?.action) {
      console.error(`❌ [${requestId}] Missing action field`);
      return errorResponse('Missing required field: action', 400, requestId);
    }

    const { action, data } = requestBody;
    console.log(`🎯 [${requestId}] Action: ${action}`, data ? Object.keys(data) : 'no data');

    // Initialize Supabase client
    let supabase;
    try {
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Supabase configuration missing');
      }
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    } catch (error) {
      console.error(`❌ [${requestId}] Supabase initialization failed:`, error instanceof Error ? error.message : String(error));
      return errorResponse('Database connection failed', 500, requestId);
    }

    // Route to action handlers with timeout
    const actionTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Action timeout after 30 seconds')), 30000)
    );

    let result: Response;
    try {
      switch (action) {
        case 'test_connection':
          result = await Promise.race([testOpenAIConnection(requestId), actionTimeout]) as Response;
          break;
        case 'test_assistant_setup':
          result = await Promise.race([testAssistantSetup(supabase, requestId), actionTimeout]) as Response;
          break;
        case 'get_assistant':
          result = await Promise.race([getAssistant(requestId), actionTimeout]) as Response;
          break;
        case 'create_thread':
          result = await Promise.race([createThread(data, supabase, requestId), actionTimeout]) as Response;
          break;
        case 'send_message':
          result = await Promise.race([sendMessage(data, supabase, requestId), actionTimeout]) as Response;
          break;
        case 'run_assistant':
          result = await Promise.race([runAssistant(data, requestId), actionTimeout]) as Response;
          break;
        case 'get_run_status':
          result = await Promise.race([getRunStatus(data, requestId), actionTimeout]) as Response;
          break;
        case 'submit_tool_outputs':
          result = await Promise.race([submitToolOutputs(data, supabase, requestId), actionTimeout]) as Response;
          break;
        default:
          console.error(`❌ [${requestId}] Unknown action: ${action}`);
          return errorResponse(`Unknown action: ${action}`, 400, requestId);
      }
      
      console.log(`✅ [${requestId}] Action completed successfully`);
      return result;
    } catch (error) {
      if (error instanceof Error && error.message === 'Action timeout after 30 seconds') {
        console.error(`⏰ [${requestId}] Action timed out`);
        return errorResponse('Request timeout', 408, requestId);
      }
      throw error;
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Unhandled error:`, {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'UnknownError'
    });
    return errorResponse(`Internal server error: ${error instanceof Error ? error.message : String(error)}`, 500, requestId);
  }
});

function validateEnvironment(requestId: string) {
  const issues: string[] = [];
  
  if (!OPENAI_API_KEY) {
    issues.push('OPENAI_API_KEY is missing');
  } else if (!OPENAI_API_KEY.startsWith('sk-')) {
    issues.push('OPENAI_API_KEY appears invalid (should start with sk-)');
  }

  if (!OPENAI_ASSISTANT_ID) {
    issues.push('OPENAI_ASSISTANT_ID is missing');
  } else if (!OPENAI_ASSISTANT_ID.startsWith('asst_')) {
    issues.push('OPENAI_ASSISTANT_ID appears invalid (should start with asst_)');
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    issues.push('Supabase configuration missing');
  }

  if (issues.length > 0) {
    console.error(`❌ [${requestId}] Environment issues:`, issues);
    return { 
      success: false, 
      error: `Configuration issues: ${issues.join(', ')}`,
      issues 
    };
  }

  return { success: true };
}

function errorResponse(message: string, status: number, requestId?: string) {
  const errorId = requestId || crypto.randomUUID().substring(0, 8);
  const errorData = {
    error: message,
    success: false,
    requestId: errorId,
    timestamp: new Date().toISOString(),
    status
  };
  
  console.error(`❌ [${errorId}] Error response:`, errorData);
  
  return new Response(JSON.stringify(errorData), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function successResponse(data: any, requestId?: string) {
  const successId = requestId || crypto.randomUUID().substring(0, 8);
  const responseData = {
    success: true,
    requestId: successId,
    timestamp: new Date().toISOString(),
    ...data
  };
  
  console.log(`✅ [${successId}] Success response:`, Object.keys(responseData));
  
  return new Response(JSON.stringify(responseData), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function openAIRequest(endpoint: string, options: any, requestId: string) {
  console.log(`🤖 [${requestId}] OpenAI request: ${endpoint}`);
  
  try {
    const url = `https://api.openai.com/v1/${endpoint}`;
    const requestOptions = {
      ...options,
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
        ...options.headers
      }
    };

    console.log(`📤 [${requestId}] Making request to ${url}:`, {
      method: requestOptions.method,
      hasBody: !!requestOptions.body,
      bodySize: requestOptions.body ? requestOptions.body.length : 0
    });

    const response = await fetch(url, requestOptions);
    const responseText = await response.text();
    
    console.log(`📥 [${requestId}] OpenAI response:`, {
      status: response.status,
      ok: response.ok,
      responseSize: responseText.length,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`❌ [${requestId}] Failed to parse error response:`, parseError instanceof Error ? parseError.message : String(parseError));
        errorDetails = { message: responseText.substring(0, 200) };
      }
      
      const error = new Error(`OpenAI API error: ${response.status} - ${errorDetails.error?.message || errorDetails.message || 'Unknown error'}`);
      (error as any).status = response.status;
      (error as any).response = errorDetails;
      throw error;
    }

    const parsedResponse = JSON.parse(responseText);
    console.log(`✅ [${requestId}] OpenAI request successful`);
    return parsedResponse;
  } catch (error) {
    console.error(`❌ [${requestId}] OpenAI request failed:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

async function testOpenAIConnection(requestId: string) {
  console.log(`🔧 [${requestId}] Testing OpenAI connection...`);
  
  const results = {
    connection: false,
    assistant: false,
    errors: [] as string[],
    details: {} as any
  };

  try {
    // Test basic API connection
    const response = await openAIRequest('models', { method: 'GET' }, requestId);
    results.connection = true;
    results.details.modelsCount = response.data?.length || 0;
    console.log(`✅ [${requestId}] OpenAI connection test passed`);
  } catch (error) {
    results.errors.push(`OpenAI: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`❌ [${requestId}] OpenAI connection test failed:`, error);
  }

  // Test assistant access if we have an ID
  if (OPENAI_ASSISTANT_ID && results.connection) {
    try {
      const assistant = await openAIRequest(`assistants/${OPENAI_ASSISTANT_ID}`, { method: 'GET' }, requestId);
      results.assistant = true;
      results.details.assistantName = assistant.name;
      results.details.assistantModel = assistant.model;
      console.log(`✅ [${requestId}] Assistant access test passed`);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
          results.errors.push(`Assistant: ID ${OPENAI_ASSISTANT_ID} not found - may need to create a new assistant`);
        } else if (error.message.includes('401')) {
          results.errors.push(`Assistant: API key lacks permission for Assistant API`);
        } else {
          results.errors.push(`Assistant: ${error.message}`);
        }
      } else {
        results.errors.push(`Assistant: ${String(error)}`);
      }
      console.error(`❌ [${requestId}] Assistant test failed:`, error);
    }
  }

  const overallSuccess = results.connection && results.errors.length === 0;
  console.log(`${overallSuccess ? '✅' : '❌'} [${requestId}] Connection test completed:`, results);
  
  return successResponse({
    connectionTest: results,
    recommendation: overallSuccess 
      ? 'All systems operational' 
      : `Issues found: ${results.errors.join(', ')}`
  }, requestId);
}

async function testAssistantSetup(supabase: any, requestId: string) {
  console.log(`🔧 [${requestId}] Testing complete assistant setup...`);
  
  const results = {
    openai: false,
    assistant: false,
    supabase: false,
    errors: [] as string[],
    details: {} as any
  };

  // Test OpenAI connection
  try {
    const response = await openAIRequest('models', { method: 'GET' }, requestId);
    results.openai = true;
    results.details.modelsCount = response.data?.length || 0;
  } catch (error) {
    results.errors.push(`OpenAI API: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Test Assistant
  if (OPENAI_ASSISTANT_ID && results.openai) {
    try {
      const assistant = await openAIRequest(`assistants/${OPENAI_ASSISTANT_ID}`, { method: 'GET' }, requestId);
      results.assistant = true;
      results.details.assistant = {
        name: assistant.name,
        model: assistant.model,
        tools: assistant.tools?.length || 0
      };
    } catch (error) {
      results.errors.push(`Assistant: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Test Supabase connection
  try {
    const { data, error } = await supabase.from('enhanced_service_providers').select('count').limit(1);
    if (error) throw error;
    results.supabase = true;
    results.details.supabaseConnection = 'OK';
  } catch (error) {
    results.errors.push(`Supabase: ${error instanceof Error ? error.message : String(error)}`);
  }

  const overallSuccess = results.openai && results.assistant && results.supabase;
  
  return successResponse({
    setupTest: results,
    overallStatus: overallSuccess ? 'ready' : 'issues_found',
    recommendation: overallSuccess 
      ? 'Assistant is fully configured and ready' 
      : `Configuration issues: ${results.errors.join(', ')}`
  }, requestId);
}

async function getAssistant(requestId: string) {
  console.log(`👤 [${requestId}] Getting assistant details...`);

  if (!OPENAI_ASSISTANT_ID) {
    return errorResponse('Assistant ID not configured', 400, requestId);
  }

  try {
    const assistant = await openAIRequest(`assistants/${OPENAI_ASSISTANT_ID}`, { method: 'GET' }, requestId);
    
    return successResponse({
      assistant: {
        id: assistant.id,
        name: assistant.name,
        model: assistant.model,
        instructions: assistant.instructions?.substring(0, 200) + '...',
        tools: assistant.tools?.map((tool: any) => ({
          type: tool.type,
          functionName: tool.function?.name
        })) || [],
        created_at: assistant.created_at,
        metadata: assistant.metadata
      }
    }, requestId);
  } catch (error) {
    console.error(`❌ [${requestId}] OpenAI connection failed:`, error instanceof Error ? error.message : String(error));
    return errorResponse(`OpenAI connection failed: ${error instanceof Error ? error.message : String(error)}`, 500, requestId);
  }
}

async function createThread(data: any, supabase: any, requestId: string) {
  console.log(`🧵 [${requestId}] Creating conversation thread...`);

  try {
    const thread = await openAIRequest('threads', {
      method: 'POST',
      body: JSON.stringify({
        metadata: {
          userId: data.userId || 'anonymous',
          sessionId: data.sessionId,
          createdAt: new Date().toISOString()
        }
      })
    }, requestId);

    // Store thread in Supabase for persistence
    if (data.userId) {
      const { error } = await supabase
        .from('user_conversations')
        .insert({
          user_id: data.userId,
          thread_id: thread.id,
          session_id: data.sessionId,
          conversation_data: { thread_metadata: thread.metadata },
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error(`❌ [${requestId}] Failed to store thread:`, error);
      }
    }

    return successResponse({
      thread: {
        id: thread.id,
        created_at: thread.created_at,
        metadata: thread.metadata
      }
    }, requestId);
  } catch (error) {
    return errorResponse(`Failed to create thread: ${error instanceof Error ? error.message : String(error)}`, 500, requestId);
  }
}

async function sendMessage(data: any, supabase: any, requestId: string) {
  console.log(`💬 [${requestId}] Sending message to thread...`);

  if (!data.threadId || !data.message) {
    return errorResponse('Missing required fields: threadId, message', 400, requestId);
  }

  try {
    const message = await openAIRequest(`threads/${data.threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        role: 'user',
        content: data.message,
        metadata: {
          timestamp: new Date().toISOString(),
          userId: data.userId || 'anonymous'
        }
      })
    }, requestId);

    return successResponse({
      message: {
        id: message.id,
        thread_id: message.thread_id,
        role: message.role,
        content: message.content,
        created_at: message.created_at
      }
    }, requestId);
  } catch (error) {
    return errorResponse(`Failed to send message: ${error instanceof Error ? error.message : String(error)}`, 500, requestId);
  }
}

async function runAssistant(data: any, requestId: string) {
  console.log(`🏃 [${requestId}] Running assistant on thread...`);

  if (!data.threadId) {
    return errorResponse('Missing required field: threadId', 400, requestId);
  }

  if (!OPENAI_ASSISTANT_ID) {
    return errorResponse('Assistant ID not configured', 400, requestId);
  }

  try {
    const run = await openAIRequest(`threads/${data.threadId}/runs`, {
      method: 'POST',
      body: JSON.stringify({
        assistant_id: OPENAI_ASSISTANT_ID,
        instructions: data.instructions || undefined,
        additional_instructions: data.additionalInstructions || undefined,
        tools: data.tools || undefined,
        metadata: {
          startTime: new Date().toISOString(),
          userId: data.userId || 'anonymous'
        }
      })
    }, requestId);

    return successResponse({
      run: {
        id: run.id,
        thread_id: run.thread_id,
        assistant_id: run.assistant_id,
        status: run.status,
        created_at: run.created_at,
        metadata: run.metadata
      }
    }, requestId);
  } catch (error) {
    return errorResponse(`Failed to run assistant: ${error instanceof Error ? error.message : String(error)}`, 500, requestId);
  }
}

async function getRunStatus(data: any, requestId: string) {
  console.log(`📊 [${requestId}] Getting run status...`);

  if (!data.threadId || !data.runId) {
    return errorResponse('Missing required fields: threadId, runId', 400, requestId);
  }

  try {
    const run = await openAIRequest(`threads/${data.threadId}/runs/${data.runId}`, {
      method: 'GET'
    }, requestId);

    let messages = null;
    let toolOutputs = null;

    // If run is completed, get the latest messages
    if (run.status === 'completed') {
      try {
        const messagesResponse = await openAIRequest(`threads/${data.threadId}/messages`, {
          method: 'GET'
        }, requestId);
        messages = messagesResponse.data?.slice(0, 5) || []; // Get latest 5 messages
      } catch (error) {
        console.error(`❌ [${requestId}] Failed to get messages:`, error);
      }
    }

    // If run requires action, get required tool calls
    if (run.status === 'requires_action') {
      toolOutputs = run.required_action?.submit_tool_outputs?.tool_calls || [];
    }

    return successResponse({
      run: {
        id: run.id,
        thread_id: run.thread_id,
        assistant_id: run.assistant_id,
        status: run.status,
        created_at: run.created_at,
        completed_at: run.completed_at,
        failed_at: run.failed_at,
        last_error: run.last_error,
        metadata: run.metadata
      },
      messages,
      toolOutputs,
      requiresAction: run.status === 'requires_action',
      isComplete: run.status === 'completed'
    }, requestId);
  } catch (error) {
    return errorResponse(`Failed to get run status: ${error instanceof Error ? error.message : String(error)}`, 500, requestId);
  }
}

async function submitToolOutputs(data: any, supabase: any, requestId: string) {
  console.log(`🔧 [${requestId}] Submitting tool outputs...`);

  if (!data.threadId || !data.runId || !data.toolOutputs) {
    return errorResponse('Missing required fields: threadId, runId, toolOutputs', 400, requestId);
  }

  try {
    // Process tool outputs (this is where you'd handle function calls)
    const processedOutputs = [];
    
    for (const toolCall of data.toolOutputs) {
      let output = '';
      
      try {
        // Handle different tool types
        switch (toolCall.function?.name) {
          case 'get_property_analysis':
            // Query property analysis from Supabase
            const { data: analysis } = await supabase
              .from('user_property_analyses')
              .select('*')
              .eq('id', toolCall.function.arguments.analysisId)
              .single();
            output = JSON.stringify(analysis || { error: 'Analysis not found' });
            break;
            
          case 'get_service_providers':
            // Query service providers
            const { data: providers } = await supabase
              .from('enhanced_service_providers')
              .select('*')
              .in('asset_types', toolCall.function.arguments.assetTypes || []);
            output = JSON.stringify(providers || []);
            break;
            
          default:
            output = JSON.stringify({ 
              message: `Function ${toolCall.function?.name} not implemented`,
              status: 'not_implemented' 
            });
        }
      } catch (error) {
        output = JSON.stringify({ 
          error: `Tool execution failed: ${error instanceof Error ? error.message : String(error)}` 
        });
      }
      
      processedOutputs.push({
        tool_call_id: toolCall.id,
        output: output
      });
    }

    // Submit outputs to OpenAI
    const run = await openAIRequest(`threads/${data.threadId}/runs/${data.runId}/submit_tool_outputs`, {
      method: 'POST',
      body: JSON.stringify({
        tool_outputs: processedOutputs
      })
    }, requestId);

    return successResponse({
      run: {
        id: run.id,
        status: run.status,
        thread_id: run.thread_id
      },
      toolOutputsSubmitted: processedOutputs.length
    }, requestId);
  } catch (error) {
    return errorResponse(`Failed to submit tool outputs: ${error instanceof Error ? error.message : String(error)}`, 500, requestId);
  }
}