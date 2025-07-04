import { useEffect, useState } from 'react';
import { useServiceWorkerUpdateNotification as useUpdateNotification } from '../hooks/useServiceWorker';

const UpdateNotification = () => {
  useUpdateNotification();

  return null;
};

export default UpdateNotification;
