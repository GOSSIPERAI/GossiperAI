Example reference:


supabase
  .channel(`transcriptions:${sessionId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'transcriptions',
      filter: `session_id=eq.${sessionId}`,
    },
    (payload) => {
      console.log('New transcription:', payload.new);
      // Update the live transcription UI here
    }
  )
  .subscribe();


  //Ensure that when the component unmounts:
supabase.removeChannel(channel);
