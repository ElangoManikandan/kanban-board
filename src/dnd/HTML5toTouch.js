import { TouchBackend } from 'react-dnd-touch-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';

export const HTML5toTouch = {
  backends: [
    {
      backend: HTML5Backend,
    },
    {
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchBackend.supportsTouch,
    },
  ],
};
