// Simple health check endpoint - no external dependencies
Deno.serve(() => {
  return new Response(
    JSON.stringify({ status: "ok", message: "Server is running" }),
    { 
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      } 
    }
  );
});