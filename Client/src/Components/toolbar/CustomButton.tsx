import React from 'react';
import Button from '@mui/material/Button';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
	palette: {
		primary: {
			main: '#ffa500', // Orange to match the connection lines
		},
	},
	typography: {
		button: {
			textTransform: 'none', // Keeps text clean
			fontWeight: 600,
		},
	},
});

const CustomButton = () => {
	return (
		<ThemeProvider theme={theme}>
			<Button
				variant="outlined"
				color="primary"
				sx={{
					borderRadius: '8px',
					padding: '6px 16px',
					fontSize: '0.875rem',
					borderColor: '#ffa500', // Matches the orange theme
					color: '#ffa500',
					'&:hover': {
						backgroundColor: '#ffa500', // Orange background on hover
						color: '#fff', // White text for contrast
						borderColor: '#ffa500',
					},
				}}
			>
        Custom Button
			</Button>
		</ThemeProvider>
	);
};

export default CustomButton;
