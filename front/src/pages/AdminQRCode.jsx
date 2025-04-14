import React, { useRef } from 'react';
import { Box, Button, Typography, Paper, Container, Card, CardContent } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react'; // Updated import

export default function AdminQRCode() {
  const qrRef = useRef();
  
  // The value encoded in the QR code
  const qrValue = `${window.location.origin}/check-in-out?action=scan`;
  
  const downloadQR = () => {
    const svgElement = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = 'gym-checkin-qr-code.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const printQR = () => {
    const printContent = document.getElementById('printable-qr');
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: '12px' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Gym Check-In/Out QR Code
        </Typography>
        <Typography variant="body1" paragraph>
          Print this QR code and place it at the gym entrance. Users can scan this code to check in and out.
        </Typography>
        
        <div id="printable-qr">
          <Card elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Scan to Check In/Out
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <QRCodeSVG 
                  value={qrValue} 
                  size={250}
                  level="H"
                  includeMargin={true}
                  ref={qrRef}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                University Gymnasium Management System
              </Typography>
            </CardContent>
          </Card>
        </div>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
          <Button variant="contained" onClick={downloadQR}>
            Download QR Code
          </Button>
          <Button variant="outlined" onClick={printQR}>
            Print QR Code
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}