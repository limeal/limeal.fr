"use client";

import { useAuthContext } from '@/contexts/AuthContext';
import './style.scss';

const Credits = () => {


  const { user } = useAuthContext();
  
    return (
        <div className="credits">
            <p>Develop by: {user ? "Paul G." : "Limeal"}</p>
            <p>Design by: Syarhu M</p>
        </div>
    )
}

export default Credits;