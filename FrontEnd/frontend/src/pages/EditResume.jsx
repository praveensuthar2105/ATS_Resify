import React from 'react';
import { ResumeProvider } from '../context/ResumeContext';
import EditResumeContent from '../components/editor/EditResumeContent';

const EditResume = () => {
  return (
    <ResumeProvider>
      <EditResumeContent />
    </ResumeProvider>
  );
};

export default EditResume;
