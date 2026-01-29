import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Landing from './pages/Landing';
import { RecipientStep, SongStep, MessageStep, DeliveryStep, SuccessPage } from './pages/CreateFlow';
import ViewNote from './pages/ViewNote';
import { NoteData } from './types';

// Initial state for a new note
const initialNoteData: NoteData = {
  recipientName: '',
  vibe: null,
  song: null,
  songData: null,
  message: '',
  photo: null,
  photoBase64: null,
  isAnonymous: true,
  senderName: '',
  deliveryMethod: 'self',
  senderEmail: '',
  recipientInstagram: '',
};

// Create flow wrapper component
const CreateFlowWrapper: React.FC = () => {
  const { step } = useParams<{ step: string }>();
  const navigate = useNavigate();
  const [noteData, setNoteData] = useState<NoteData>(initialNoteData);

  const updateNoteData = (data: Partial<NoteData>) => {
    setNoteData((prev) => ({ ...prev, ...data }));
  };

  const stepComponents: Record<string, React.ReactNode> = {
    recipient: <RecipientStep data={noteData} updateData={updateNoteData} />,
    song: <SongStep data={noteData} updateData={updateNoteData} />,
    message: <MessageStep data={noteData} updateData={updateNoteData} />,
    delivery: <DeliveryStep data={noteData} updateData={updateNoteData} />,
  };

  return <>{stepComponents[step || 'recipient']}</>;
};

// Success wrapper
const SuccessWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [noteData] = useState<NoteData>({ ...initialNoteData, id, deliveryMethod: 'self' });
  return <SuccessPage data={noteData} />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create/:step" element={<CreateFlowWrapper />} />
        <Route path="/success/:id" element={<SuccessWrapper />} />
        <Route path="/view/:id" element={<ViewNote />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
