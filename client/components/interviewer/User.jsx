import { useEffect, useRef, useState } from 'react';
import Video from '@/components/icons/Video';
import EndCall from '@/components/icons/EndCall';
import { VideoOff } from 'lucide-react';
import Speaking from '../icons/Speaking';
import Geneva from './Geneva';

const VideoCall = ({
    isUserTurn,
    setShowPopUp,
    isMicOn,
    setIsMicOn,
    startRecording,
    stopRecording,
    handleEndInterview,
    showPopUp,
    isBreakPoint,
    isAudioPlaying,
}) => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [hasCameraError, setHasCameraError] = useState(false);

    useEffect(() => {
        setupMediaStream();
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (videoRef.current && stream && !hasCameraError) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, isVideoOn, hasCameraError]);

    const setupMediaStream = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setStream(mediaStream);
            setHasCameraError(false);
        } catch (error) {
            console.error('Camera access error:', error);
            setHasCameraError(true);
        }
    };

    const handleMicClick = () => {
        if (isMicOn) {
            stopRecording();
        } else {
            startRecording();
        }
        setIsMicOn(!isMicOn);
        setShowPopUp(!showPopUp);
    };

    const toggleVideo = async () => {
        if (!stream) return;

        if (isVideoOn) {
            // When turning video off
            stream.getVideoTracks().forEach((track) => {
                track.stop();
                stream.removeTrack(track);
            });
            setIsVideoOn(false);
            
            // Also stop recording if mic is on when video is turned off
            if (isMicOn) {
                stopRecording();
                setIsMicOn(false);
                setShowPopUp(false);
            }
        } else {
            // When turning video back on
            try {
                const newVideoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                const newVideoTrack = newVideoStream.getVideoTracks()[0];
                stream.addTrack(newVideoTrack);
                setIsVideoOn(true);
                
                // Note: We don't automatically restart mic recording when video is turned back on
                // This gives the user control over when to start speaking again
            } catch (error) {
                console.error('Error turning camera back on:', error);
            }
        }
    };

    const endCall = () => {
        // Stop recording if mic is on when ending the call
        if (isMicOn) {
            stopRecording();
            setIsMicOn(false);
        }
        
        // Stop all tracks in the stream
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        
        handleEndInterview();
    };

    return (
        <div className="relative h-[100%] overflow-hidden rounded-md">
            {isBreakPoint && (
            <div className="absolute top-1 right-1 pb-5 mr-4">
                <Speaking isSpeaking={isMicOn}/>
            </div>
            )}

            {hasCameraError ? (
                <div className="bg-black h-[100%] grid place-items-center">
                    <div className="relative">
                        <div className="bg-primary rounded-md h-[100px] w-[100px] rotate-45"></div>
                        <div className="absolute top-0 border-[1px] border-gray-50 bg-transparent backdrop-blur-[10px] text-white h-[100px] w-[100px] rounded-md flex items-center justify-center">
                            <VideoOff size="32" />
                        </div>
                    </div>
                </div>
            ) : isVideoOn ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-[100%] h-[100%] object-cover z-10"
                />
            ) : (
                <div className="bg-black h-[100%] grid place-items-center">
                    <div className="relative">
                        <div className="bg-primary rounded-md h-[100px] w-[100px] rotate-45"></div>
                        <div className="absolute top-0 border-[1px] border-gray-50 bg-transparent backdrop-blur-[10px] text-white h-[100px] w-[100px] rounded-md flex items-center justify-center">
                            <VideoOff size="32" />
                        </div>
                    </div>
                </div>
            )}

            {isVideoOn && (
                <div className="text-black py-1 pl-1 pr-4 bg-gray-100 border-[1px] border-halfwhite rounded-full absolute top-3 left-3 z-[99] flex gap-2 items-center">
                    <span className="font-semibold h-7 w-7 bg-primary text-white rounded-full flex items-center justify-center">D</span>
                    <p>You</p>
                </div>
            )}

            <div className="absolute bottom-0 w-full pb-4 flex justify-center gap-10">
                {isUserTurn && isVideoOn && ( // Only show mic button when video is on
                    <button
                        className={`relative rounded-full w-fit p-2 ${isMicOn ? 'bg-green-400 text-white' : 'bg-gray-300 text-black'}`}
                        onClick={handleMicClick}
                    >
                        {showPopUp && (
                            <span className="text-sm w-[200px] rounded-md py-4 absolute -top-[70px] left-0 lap:-left-[50px] bg-primary text-white">
                                It's your turn, click to answer
                            </span>
                        )}
                        {isMicOn ? 'Send Response' : 'Speak Now'}
                    </button>
                )}

                <button
                    className={`relative rounded-full w-fit p-2 bg-black text-white ${isVideoOn ? '' : 'bg-gray-600'}`}
                    onClick={toggleVideo}
                    title={isVideoOn ? "Turn off camera" : "Turn on camera"}
                >
                    <span className="text-white relative flex items-center">
                        <Video size="22" />
                        {!isVideoOn && <div className="absolute -left-3 top-1 w-7 h-7 border-t-[2px] border-red-500 rotate-45"></div>}
                    </span>
                </button>

                <button 
                    className="bg-[#FD473F] rounded-full w-fit px-4 py-2" 
                    onClick={endCall}
                    title="End interview"
                >
                    <span className="text-white">
                        <EndCall size="22" />
                    </span>
                </button>
            </div>
        </div>
    );
};

export default VideoCall;