import { writable } from 'svelte/store';

const API_BASE = '/api';

export const posts = writable([]);
export const loading = writable(false);
export const twitterStatus = writable({ valid: false, user: null });

export async function loadPosts() {
  loading.set(true);
  try {
    const response = await fetch(`${API_BASE}/posts`);
    const data = await response.json();
    posts.set(data);
  } catch (error) {
    console.error('Failed to load posts:', error);
  } finally {
    loading.set(false);
  }
}

export async function createPost(postData) {
  const response = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return response.json();
}

export async function updatePost(id, postData) {
  const response = await fetch(`${API_BASE}/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return response.json();
}

export async function deletePost(id) {
  const response = await fetch(`${API_BASE}/posts/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return response.json();
}

export async function checkTwitterStatus() {
  try {
    const response = await fetch(`${API_BASE}/twitter/verify`);
    const data = await response.json();
    twitterStatus.set(data);
  } catch (error) {
    console.error('Failed to check Twitter status:', error);
    twitterStatus.set({ valid: false, error: error.message });
  }
}
