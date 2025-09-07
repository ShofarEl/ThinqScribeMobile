// src/utils/specialties.js - Predefined writing specialties for the platform

export const PREDEFINED_SPECIALTIES = [
    'Academic Writing',
    'Research Papers', 
    'Essays',
    'Literature Review',
    'Case Studies',
    'Thesis Writing',
    'Dissertation',
    'Creative Writing',
    'Technical Writing',
    'Business Writing',
    'Marketing Content',
    'Blog Writing',
    'Copywriting',
    'Grant Writing',
    'Scientific Writing',
    'Medical Writing',
    'Legal Writing',
    'Journalism',
    'Editing & Proofreading',
    'Translation',
    'Book Writing',
    'Screenplay Writing',
    'Poetry',
    'Web Content',
    'Social Media Content',
    'Product Descriptions',
    'Press Releases',
    'White Papers',
    'Proposals',
    'Reports'
  ];
  
  // Helper function to get specialties with user's custom ones
  export const getAllSpecialties = (userSpecialties = []) => {
    const combined = [...PREDEFINED_SPECIALTIES, ...userSpecialties];
    return [...new Set(combined)]; // Remove duplicates
  };
  
  // Helper function to suggest specialties based on search
  export const searchSpecialties = (searchTerm) => {
    if (!searchTerm) return PREDEFINED_SPECIALTIES;
    
    const term = searchTerm.toLowerCase();
    return PREDEFINED_SPECIALTIES.filter(specialty => 
      specialty.toLowerCase().includes(term)
    );
  };
  