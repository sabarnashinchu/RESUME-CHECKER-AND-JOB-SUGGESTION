import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  Slide,
  Zoom,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import 'pdfjs-dist/legacy/build/pdf.worker';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PreviewContainer = styled(Box)({
  width: '100%',
  height: '80vh',
  overflow: 'auto',
  backgroundColor: '#f5f5f5',
  padding: '20px',
});

const ResumePreview = ({ file }) => {
  const [open, setOpen] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [canvasUrl, setCanvasUrl] = useState(null);

  useEffect(() => {
    if (file && file.type === 'application/pdf') {
      const fileReader = new FileReader();
      fileReader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
      };
      fileReader.readAsArrayBuffer(file);
    }
  }, [file]);

  useEffect(() => {
    const renderPDF = async () => {
      if (!pdfDoc) return;
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      setCanvasUrl(canvas.toDataURL());
    };
    if (pdfDoc) {
      renderPDF();
    }
  }, [pdfDoc, currentPage, scale]);

  const handlePreview = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setPdfDoc(null);
    setCurrentPage(1);
    setCanvasUrl(null);
  };

  return (
    <Box sx={{ mt: 2, textAlign: 'center' }}>
      <Zoom in={true}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            display: 'inline-flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          onClick={handlePreview}
        >
          <VisibilityIcon sx={{ mr: 1 }} />
          <Typography variant="body2">Preview Resume</Typography>
        </Paper>
      </Zoom>

      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <PreviewContainer>
            {file?.type === 'application/pdf' ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <IconButton 
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    ←
                  </IconButton>
                  <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                    Page {currentPage} of {numPages}
                  </Typography>
                  <IconButton 
                    disabled={currentPage >= numPages}
                    onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                  >
                    →
                  </IconButton>
                </Box>
                <Box id="pdf-container" sx={{ display: 'flex', justifyContent: 'center' }}>
                  {canvasUrl && <img src={canvasUrl} alt={`Page ${currentPage}`} style={{ maxWidth: '100%', height: 'auto' }} />}
                </Box>
              </>
            ) : (
              <Typography variant="body1" sx={{ p: 2 }}>
                Preview is only available for PDF files.
              </Typography>
            )}
          </PreviewContainer>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ResumePreview; 