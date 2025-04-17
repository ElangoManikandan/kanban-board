import { TouchBackend } from 'react-dnd-touch-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';

export const HTML5toTouch = {
  backends: [
    {
      id: 'html5', // ✅ added ID
      backend: HTML5Backend,
    },
    {
      id: 'touch', // ✅ added ID
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchBackend.supportsTouch,
    },
  ],
};
