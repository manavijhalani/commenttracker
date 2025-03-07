import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  Alert,
  Stack,
  FormGroup,
} from '@mui/material';
import { AddPhotoAlternate as AddPhotoIcon } from '@mui/icons-material';
import { supabase } from './supabaseClient';

const App = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    name: '',
    email: '',
    requesterEmail: '',
    type: 'comment',
    message: '',
    hasImageIssue: false,
    image: null,
    timestamp: '',
  });
  const [notification, setNotification] = useState({ message: '', severity: 'success' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const storedComments = localStorage.getItem('comments');
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('comments', JSON.stringify(comments));
  }, [comments]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewComment({ ...newComment, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.name || !newComment.message || !newComment.email || !newComment.requesterEmail) {
      setNotification({ message: 'Please fill in all required fields', severity: 'error' });
      return;
    }

    if (editingId) {
      setNotification({ message: 'You cannot edit comments', severity: 'warning' });
      setEditingId(false);
    } else {
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            blog_writer_email: newComment.requesterEmail,
            commenter_email: newComment.email,
            comment: newComment.message,
            name_commenter: newComment.name,
            type: newComment.type,
            image: newComment.image,
            created_at: timestamp,
          },
        ])
        .select();

      if (error||!data) {
        console.error('Supabase insert error:', error.message);
        setNotification({ message: `Error: ${error.message}`, severity: 'error' });
      } else {
        setNotification({ message: 'New comment added!', severity: 'success' });
      }
    }

    setNewComment({
      name: '',
      email: '',
      requesterEmail: '',
      type: 'comment',
      message: '',
      hasImageIssue: false,
      image: null,
      timestamp: '',
    });
    setTimeout(() => setNotification({ message: '', severity: 'success' }), 3000);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Collaboration Tracker
      </Typography>

      {notification.message && (
        <Alert severity={notification.severity} sx={{ mb: 2 }}>
          {notification.message}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Your Name"
              value={newComment.name}
              onChange={(e) =>
                setNewComment({ ...newComment, name: e.target.value })
              }
            />

            <TextField
              fullWidth
              label="Your Email"
              value={newComment.email}
              onChange={(e) =>
                setNewComment({ ...newComment, email: e.target.value })
              }
            />

            <TextField
              fullWidth
              label="Requester Email"
              value={newComment.requesterEmail}
              onChange={(e) =>
                setNewComment({ ...newComment, requesterEmail: e.target.value })
              }
            />

            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newComment.type}
                  label="Type"
                  onChange={(e) =>
                    setNewComment({ ...newComment, type: e.target.value })
                  }
                >
                  <MenuItem value="comment">Comment</MenuItem>
                  <MenuItem value="issue">Issue</MenuItem>
                  <MenuItem value="bug">Bug</MenuItem>
                </Select>
              </FormControl>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newComment.hasImageIssue}
                      onChange={(e) =>
                        setNewComment({
                          ...newComment,
                          hasImageIssue: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Image Problem"
                />
              </FormGroup>
            </Stack>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Your message"
              value={newComment.message}
              onChange={(e) =>
                setNewComment({ ...newComment, message: e.target.value })
              }
            />

            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AddPhotoIcon />}
                >
                  Upload Image
                </Button>
              </label>
              {newComment.image && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={newComment.image}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                  />
                  <Button
                    color="error"
                    onClick={() =>
                      setNewComment({ ...newComment, image: null })
                    }
                    sx={{ mt: 1 }}
                  >
                    Remove Image
                  </Button>
                </Box>
              )}
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              {editingId ? 'Update' : 'Submit'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default App;
