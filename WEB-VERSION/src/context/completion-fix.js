// CRITICAL FIX for AI message deletion issue
// Add this code at the beginning of the completion handler in AIChatContext.jsx
// Right after: console.log('✅ Stream completed:', completionData);

// CRITICAL FIX: Handle actual data structure ['type', 'message', 'metadata']
if (completionData.type === 'complete' && completionData.message?.content && state.currentConversation) {
  console.log('🎯 FIXED: Using message data to update conversation');
  
  const aiMessage = {
    role: 'assistant',
    content: completionData.message.content,
    timestamp: new Date(),
    metadata: completionData.metadata || {}
  };
  
  const updatedConversation = {
    ...state.currentConversation,
    messages: [...state.currentConversation.messages, aiMessage]
  };
  
  console.log('📝 FIXED: Updating conversation with AI response');
  
  // Update conversation state immediately
  dispatch({ type: actionTypes.UPDATE_CONVERSATION, payload: updatedConversation });
  dispatch({ type: actionTypes.SET_CURRENT_CONVERSATION, payload: updatedConversation });
  
  // Show success message
  if (completionData.metadata?.processingTime) {
    const time = (completionData.metadata.processingTime / 1000).toFixed(1);
    antMessage.success(`Response generated in ${time}s`);
  }
  
  // Reset streaming state
  setTimeout(() => {
    console.log('✅ FIXED: Resetting streaming - message saved successfully');
    dispatch({ type: actionTypes.RESET_STREAMING });
  }, 500);
  
  dispatch({ type: actionTypes.SET_LOADING, payload: false });
  return; // Exit early - successful completion
} 