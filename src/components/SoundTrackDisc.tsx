import { useEffect, useRef, useState } from 'react';
import SoundTrackDiscImage from '/assets/images/soundtrack_disc.png';

const SoundTrackDisc = () => {
    const [play, setPlay] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    const handleClick = () => {
        setPlay((prev) => !prev);
    };

    useEffect(() => {
        // audioRef.current = new Audio('/assets/audios/alice-in-dark-wonderland-123894.mp3');
        audioRef.current = new Audio('/assets/audios/alice-underground-avril-lavigne.mp3');
        audioRef.current.loop = true;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        }
    }, []);

    useEffect(() => {
        if (!audioRef.current) {
            return;
        }

        if (play) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, [play]);

    return (
        <img
            src={SoundTrackDiscImage}
            alt='alice in onederland'
            className={`w-20 cursor-pointer hover:rotate-180 transition-transform duration-500 ${play ? "animate-spin" : ""}`}
            onClick={handleClick}
        />
    )
}

export default SoundTrackDisc