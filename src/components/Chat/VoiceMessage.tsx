// ===========================================
// VOICE MESSAGE COMPONENT
// Recording and playback of voice messages
// ===========================================

import { useState, useRef, useEffect } from 'react';
import { Button, message as antMessage, Progress } from 'antd';
import { AudioOutlined, StopOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { colors, spacing, typography } from '../../styles/tokens';
import { logger } from '../../utils/logger';

interface VoiceMessageProps {
  audioUrl?: string;
  onRecordComplete?: (audioBlob: Blob) => void;
  onSend?: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export const VoiceMessage: React.FC<VoiceMessageProps> = ({
  audioUrl,
  onRecordComplete,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSend,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if browser supports MediaRecorder
  const isSupported = typeof MediaRecorder !== 'undefined';

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, []);

  const startRecording = async () => {
    if (!isSupported) {
      antMessage.error('Voice recording is not supported in your browser');
      return;
    }

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Pick a MIME type the browser actually supports
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
        .find(t => MediaRecorder.isTypeSupported(t)) ?? '';

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        if (onRecordComplete) {
          onRecordComplete(audioBlob);
        }
        stream?.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      stream?.getTracks().forEach(track => track.stop());
      logger.error('Error starting recording:', error);
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          antMessage.error('Microphone access was denied. Please allow microphone permission in your browser settings and try again.');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          antMessage.error('No microphone found. Please connect a microphone and try again.');
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          antMessage.error('Microphone is in use by another application. Please close it and try again.');
        } else if (error.name === 'SecurityError') {
          antMessage.error('Microphone access requires a secure (HTTPS) connection.');
        } else {
          antMessage.error(`Microphone error: ${error.message}`);
        }
      } else {
        antMessage.error('Failed to start recording. Please check microphone permissions.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handlePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      playTimerRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 100);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioUrl) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setAudioDuration(audioRef.current.duration);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
            if (playTimerRef.current) {
              clearInterval(playTimerRef.current);
              playTimerRef.current = null;
            }
          }}
          style={{ display: 'none' }}
        />
        <Button
          type="text"
          icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          onClick={handlePlay}
          disabled={disabled}
        />
        <div style={{ flex: 1, minWidth: '100px' }}>
          <Progress
            percent={audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0}
            showInfo={false}
            size="small"
          />
          <div style={{ fontSize: typography.fontSize.xs, color: colors.gray[500], marginTop: spacing[1] }}>
            {formatTime(currentTime)} / {formatTime(audioDuration)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
      {!isRecording ? (
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            type="primary"
            icon={<AudioOutlined />}
            onClick={startRecording}
            disabled={disabled || !isSupported}
            danger={false}
          >
            Record
          </Button>
        </motion.div>
      ) : (
        <>
          <Button
            type="primary"
            danger
            icon={<StopOutlined />}
            onClick={stopRecording}
          >
            Stop
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], minWidth: '120px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: colors.error.solid,
                animation: 'pulse 1s infinite',
              }}
            />
            <span style={{ fontSize: typography.fontSize.sm, color: colors.gray[600] }}>
              {formatTime(recordingTime)}
            </span>
          </div>
        </>
      )}
      {!isSupported && (
        <span style={{ fontSize: typography.fontSize.xs, color: colors.gray[500] }}>
          Voice recording not supported
        </span>
      )}
    </div>
  );
};

export default VoiceMessage;



