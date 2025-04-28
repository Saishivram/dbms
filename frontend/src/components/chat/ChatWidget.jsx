import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  IconButton, 
  Collapse,
  Avatar,
  Divider,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { 
  Chat as ChatIcon, 
  Send as SendIcon, 
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';
import { chatService } from '../../services/ChatService';

const ChatWidget = ({ ownerId }) => {
  const [open, setOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message to UI immediately
    const userMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Get response from chatbot service, passing the owner ID
      const response = await chatService.sendMessage(input, ownerId);
      
      // Add assistant response to UI
      const assistantMessage = { role: 'assistant', content: response };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error getting chat response:', error);
      // Add error message
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error accessing the database. Please try again.' 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Box>
      {/* Chat toggle button */}
      <IconButton
        onClick={() => setOpen(!open)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
          zIndex: 1000,
          width: 56,
          height: 56,
        }}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </IconButton>

      {/* Chat window */}
      <Collapse in={open} timeout="auto">
        <Paper
          elevation={4}
          sx={{
            position: 'fixed',
            bottom: isFullscreen ? 0 : 90,
            right: isFullscreen ? 0 : 20,
            left: isFullscreen ? 0 : 'auto',
            top: isFullscreen ? 0 : 'auto',
            width: isFullscreen ? '100%' : { xs: '90%', sm: 400 },
            height: isFullscreen ? '100%' : 500,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 999,
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: isFullscreen ? 0 : 2,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              backgroundColor: 'primary.main',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h6">Newspaper Database Assistant</Typography>
            <Box>
              <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                <IconButton
                  size="small"
                  onClick={toggleFullscreen}
                  sx={{ color: 'white', ml: 1 }}
                >
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              p: 2,
              flexGrow: 1,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              bgcolor: '#f5f5f5',
            }}
          >
            {/* Welcome message */}
            {messages.length === 0 && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: '#e3f2fd', 
                  maxWidth: '85%',
                  alignSelf: 'center' 
                }}
              >
                <Typography variant="body1">
                  Hello! I'm your Newspaper Database Assistant. I can help you with information from your newspaper_supply_chain database. What would you like to know?
                </Typography>
              </Paper>
            )}

            {/* Chat messages */}
            {messages.map((message, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1,
                }}
              >
                {message.role === 'assistant' && (
                  <Avatar 
                    sx={{ 
                      mr: 1, 
                      bgcolor: 'primary.main',
                      width: 32,
                      height: 32
                    }}
                  >
                    DB
                  </Avatar>
                )}
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    maxWidth: isFullscreen ? '50%' : '70%',
                    backgroundColor: message.role === 'user' ? '#e0f7fa' : 'white',
                    borderRadius: message.role === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                  }}
                >
                  <Typography variant="body2">{message.content}</Typography>
                </Paper>
                {message.role === 'user' && (
                  <Avatar 
                    sx={{ 
                      ml: 1,
                      bgcolor: '#81c784',
                      width: 32,
                      height: 32
                    }}
                  >
                    You
                  </Avatar>
                )}
              </Box>
            ))}

            {/* Loading indicator */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                <Avatar 
                  sx={{ 
                    mr: 1, 
                    bgcolor: 'primary.main',
                    width: 32,
                    height: 32
                  }}
                >
                  DB
                </Avatar>
                <Paper 
                  elevation={1}
                  sx={{ 
                    p: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    borderRadius: '20px 20px 20px 5px',
                  }}
                >
                  <CircularProgress size={20} thickness={4} />
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          {/* Input area */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              gap: 1,
              bgcolor: 'background.paper',
              boxShadow: '0 -2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Ask about your newspaper data..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={3}
              variant="outlined"
            />
            <Button
              variant="contained"
              color="primary"
              disabled={loading || !input.trim()}
              onClick={handleSend}
              sx={{ minWidth: 'unset' }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default ChatWidget;