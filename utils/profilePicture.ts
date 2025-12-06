/**
 * Profile Picture Utilities
 * 
 * Helper functions for managing profile pictures
 */

import profilePic1 from '../assets/1.png';
import profilePic2 from '../assets/2.png';
import profilePic3 from '../assets/3.png';
import profilePic4 from '../assets/4.png';
import profilePic5 from '../assets/5.png';
import profilePic6 from '../assets/6.png';
import profilePic7 from '../assets/7.png';
import profilePic8 from '../assets/8.png';

export const profilePictures = [
  { id: 1, src: profilePic1 },
  { id: 2, src: profilePic2 },
  { id: 3, src: profilePic3 },
  { id: 4, src: profilePic4 },
  { id: 5, src: profilePic5 },
  { id: 6, src: profilePic6 },
  { id: 7, src: profilePic7 },
  { id: 8, src: profilePic8 },
];

/**
 * Get profile picture source by URL
 * If the URL matches one of our imported images, return the imported source
 * Otherwise return the URL as-is
 */
export function getProfilePictureSrc(url: string | undefined): string | undefined {
  if (!url) return undefined;
  
  // Check if URL matches any of our imported images
  const matchingPic = profilePictures.find(pic => pic.src === url || pic.src.includes(url) || url.includes(pic.src));
  if (matchingPic) {
    return matchingPic.src;
  }
  
  // Return the URL as-is (might be a Vite-processed path)
  return url;
}

/**
 * Get profile picture by ID
 */
export function getProfilePictureById(id: number): string {
  const pic = profilePictures.find(p => p.id === id);
  return pic?.src || profilePictures[0].src;
}

