import React, { ReactNode, useRef, useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, SxProps, Theme, alpha } from '@mui/material';

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  sx?: SxProps<Theme>;
  headerSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  actionButton,
  sx = {},
  headerSx = {},
  contentSx = {}
}) => {
  // Reference to the card for mouse movement effects
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Handle mouse movement for 3D effect
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    };

    if (isHovered) {
      card.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isHovered]);

  // Calculate the 3D transform based on mouse position
  const calculateTransform = () => {
    if (!cardRef.current || !isHovered) return '';
    const cardWidth = cardRef.current.offsetWidth;
    const cardHeight = cardRef.current.offsetHeight;
    
    const rotateY = ((mousePosition.x / cardWidth) - 0.5) * 8; 
    const rotateX = (0.5 - (mousePosition.y / cardHeight)) * 8;
    
    return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  return (
    <Paper 
      ref={cardRef}
      elevation={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ 
        position: 'relative',
        borderRadius: '16px', 
        overflow: 'hidden',
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: isHovered ? calculateTransform() : 'perspective(1000px) rotateX(0) rotateY(0)',
        background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 2px 10px rgba(0, 0, 0, 0.05)',
        mb: 4,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        '&::before': {
          // Shine effect
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '200%',
          height: '100%',
          backgroundImage: 'linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.3) 40%, rgba(255, 255, 255, 0) 60%)',
          transform: isHovered ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.8s ease',
          zIndex: 2,
          pointerEvents: 'none',
        },
        '&:hover': {
          transform: 'perspective(1000px) translateY(-5px) scale(1.01)',
          boxShadow: (theme) => `0 20px 30px ${alpha(theme.palette.primary.main, 0.15)}, 0 10px 15px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
        ...sx 
      }}
    >
      {/* Liquid blob decoration in the corner */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: (theme) => `radial-gradient(circle at center, ${alpha(theme.palette.primary.light, 0.6)}, ${alpha(theme.palette.primary.main, 0)})`,
          filter: 'blur(30px)',
          zIndex: 0,
          opacity: 0.7,
          animation: 'blob-morph 8s infinite ease-in-out',
          '@keyframes blob-morph': {
            '0%': { transform: 'scale(1) translate(0, 0)' },
            '33%': { transform: 'scale(1.1) translate(-20px, 20px)' },
            '66%': { transform: 'scale(0.9) translate(20px, -20px)' },
            '100%': { transform: 'scale(1) translate(0, 0)' },
          }
        }}
      />

      {/* Header with gradient and glass effect */}
      <Box 
        sx={{ 
          position: 'relative',
          p: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          overflow: 'hidden',
          '&::before': {
            // Glass reflection
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
            borderRadius: '16px 16px 0 0',
            zIndex: 0,
          },
          ...headerSx
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            position: 'relative',
            zIndex: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            letterSpacing: '0.5px',
            fontSize: '1.1rem',
          }}
        >
          {title}
        </Typography>

        {actionButton && (
          <Button 
            variant="contained" 
            onClick={actionButton.onClick}
            sx={{ 
              position: 'relative',
              overflow: 'hidden',
              bgcolor: 'white',
              color: (theme) => theme.palette.primary.main,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                transform: 'translateY(-3px)',
                boxShadow: '0 7px 15px rgba(0,0,0,0.2)',
                '&::after': {
                  transform: 'translateX(100%)'
                }
              },
              '&::after': {
                // Shine effect on button
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.5) 50%, transparent 70%)',
                transform: 'translateX(-100%)',
                transition: 'transform 0.5s ease',
              },
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              py: 1,
              px: 2.5,
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
              zIndex: 1,
            }}
          >
            {actionButton.label}
          </Button>
        )}
      </Box>

      {/* Content area with glass morphism */}
      <Box 
        sx={{ 
          position: 'relative',
          zIndex: 1,
          p: 3, 
          backdropFilter: 'blur(10px)',
          background: (theme) => `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.7)}, ${alpha(theme.palette.background.paper, 0.9)})`,
          ...contentSx 
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

export default DashboardCard;