import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Box,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Alert,
  IconButton,
  useMediaQuery,
  Grid,
  StepButton,
  Paper,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { data } from './data';
import { lightTheme, darkTheme } from './theme';
import './styles.css';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import logo from './assets/logo.svg';
import background from './assets/background.webp';
import background1 from './assets/images/background1.jpg';
import background2 from './assets/images/background2.jpg';
import background3 from './assets/images/background3.jpg';
import background4 from './assets/images/background4.jpg';
import background5 from './assets/images/background5.jpg';
import eva from './assets/images/EVA.png';
import ost from './assets/images/ost.jpg';

// Определяем цвета Succinct
const succinctColors = {
  pink: {
    main: '#FF1B8D',
    light: '#FF69B4',
    dark: '#CC1771',
  },
  blue: {
    main: '#69C9FF',
    light: '#97DEFF',
    dark: '#5094BD',
  }
};

// Добавим стили анимации в начало файла
const styles = `
  @keyframes gradient {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || prefersDarkMode
  );
  const [quests, setQuests] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [result, setResult] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [isProving, setIsProving] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // В реальном приложении здесь будет запрос к API для получения списка квестов
    setQuests(data);
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);

  // Добавим функцию для симуляции прогресса
  useEffect(() => {
    let timer;
    if (isLoading && progress < 90) {
      timer = setInterval(() => {
        setProgress((prevProgress) => {
          const increment = Math.random() * 30;
          const newProgress = Math.min(prevProgress + increment, 90);
          return newProgress;
        });
      }, 500);
    }
    return () => {
      clearInterval(timer);
    };
  }, [isLoading, progress]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  const handleClickOpen = async (quest) => {
    try {
      setSelectedQuest(quest);
      setOpen(true);
      // Загружаем сохраненные ответы из localStorage или создаем новый массив
      const savedAnswers = localStorage.getItem(`quest_${quest.id}_answers`);
      const questions = quest.questions || [quest.question];
      setAnswers(savedAnswers ? JSON.parse(savedAnswers) : new Array(questions.length).fill(''));
      setActiveQuestion(0);
      setResult(null);
    } catch (error) {
      console.error('Error fetching quest:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAnswers([]);
    setActiveQuestion(0);
    setResult(null);
    // Показываем уведомление о сохранении
    setSnackbar({
      open: true,
      message: 'Your answer is saved, don\'t forget to verify it',
      severity: 'info'
    });
  };

  const handleAnswerChange = (e) => {
    const newAnswers = [...answers];
    newAnswers[activeQuestion] = e.target.value;
    setAnswers(newAnswers);
    // Сохраняем ответы в localStorage
    if (selectedQuest) {
      localStorage.setItem(`quest_${selectedQuest.id}_answers`, JSON.stringify(newAnswers));
    }
  };

  const handleSubmitAll = async () => {
    try {
      setIsLoading(true);
      setProgress(0);

      // Очищаем результаты верификации при новой проверке
      localStorage.removeItem('verification_result');
      localStorage.removeItem('vk');
      localStorage.removeItem('public_values');

      // Сохраняем текущие очки для сравнения
      const previousPoints = localStorage.getItem('total_points');

      // Собираем все ответы из localStorage
      const allAnswers = quests.flatMap(quest => {
        if (quest.questions) {
          // Для квестов с подвопросами (как квест 6)
          const savedAnswers = JSON.parse(localStorage.getItem(`quest_${quest.id}_answers`) || '[]');
          return savedAnswers.map((answer, index) => ({
            quest_id: quest.id,
            sub_question_id: index + 1,
            answer: answer || "wrong answer"
          }));
        } else {
          // Для обычных квестов
          const savedAnswer = localStorage.getItem(`quest_${quest.id}_answers`);
          const answer = savedAnswer ? JSON.parse(savedAnswer)[0] : "wrong answer";
          return [{
            quest_id: quest.id,
            answer
          }];
        }
      });

      // Отправляем запрос на сервер для проверки ответов
      const response = await fetch(process.env.REACT_APP_VERIFY_URL + '/verify-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: allAnswers })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setProgress(100);
      const data = await response.json();
      
      // Очищаем предыдущие результаты
      quests.forEach(quest => {
        localStorage.removeItem(`quest_${quest.id}_completed`);
        localStorage.removeItem(`quest_${quest.id}_failed`);
        localStorage.removeItem(`quest_${quest.id}_points`);
        localStorage.removeItem(`quest_${quest.id}_message`);
        
        // Специальная очистка для квеста 6
        if (quest.id === 6) {
          localStorage.removeItem('quest_6_completed');
          localStorage.removeItem('quest_6_failed');
          localStorage.removeItem('quest_6_partial');
          for (let i = 1; i <= 3; i++) {
            localStorage.removeItem(`quest_6_sub_${i}_correct`);
            localStorage.removeItem(`quest_6_sub_${i}_wrong`);
          }
        }
      });

      // Создаем мапу для хранения очков по подвопросам квеста 6
      const quest6SubPoints = new Map();

      // Проверяем ответы для квеста 6
      const quest6SuccessAnswers = data.completed_quests.filter(quest => quest.quest_id === 6);
      const quest6FailedAnswers = data.failed_quests.filter(quest => quest.quest_id === 6);
      
      if (quest6SuccessAnswers.length === 3) {
        // Если все 3 подвопроса успешны
        localStorage.setItem(`quest_6_completed`, 'true');
        localStorage.setItem(`quest_6_failed`, 'false');
        localStorage.setItem(`quest_6_partial`, 'false');
        localStorage.setItem(`quest_6_message`, 'All subquestions proved');
        
        // Считаем общие очки
        let totalQuest6Points = quest6SuccessAnswers.reduce((sum, quest) => sum + (quest.points || 0), 0);
        localStorage.setItem(`quest_6_points`, totalQuest6Points.toString());
      } else if (quest6FailedAnswers.length === 3) {
        // Если все 3 подвопроса неуспешны
        localStorage.setItem(`quest_6_completed`, 'false');
        localStorage.setItem(`quest_6_failed`, 'true');
        localStorage.setItem(`quest_6_partial`, 'false');
        localStorage.setItem(`quest_6_message`, 'All subquestions are incorrect');
        localStorage.setItem(`quest_6_points`, '0');
      } else if (quest6SuccessAnswers.length > 0) {
        // Если есть успешные подвопросы, но не все
        localStorage.setItem(`quest_6_completed`, 'false');
        localStorage.setItem(`quest_6_failed`, 'false');
        localStorage.setItem(`quest_6_partial`, 'true');
        localStorage.setItem(`quest_6_message`, `${quest6SuccessAnswers.length} of 3 subquestions proved`);
        
        // Считаем очки за успешные подвопросы
        let totalQuest6Points = quest6SuccessAnswers.reduce((sum, quest) => sum + (quest.points || 0), 0);
        localStorage.setItem(`quest_6_points`, totalQuest6Points.toString());

        // Сохраняем статусы для каждого подвопроса
        quest6SuccessAnswers.forEach(quest => {
          if (quest.sub_question_id) {
            localStorage.setItem(`quest_6_sub_${quest.sub_question_id}_correct`, 'true');
            localStorage.setItem(`quest_6_sub_${quest.sub_question_id}_wrong`, 'false');
          }
        });
        quest6FailedAnswers.forEach(quest => {
          if (quest.sub_question_id) {
            localStorage.setItem(`quest_6_sub_${quest.sub_question_id}_correct`, 'false');
            localStorage.setItem(`quest_6_sub_${quest.sub_question_id}_wrong`, 'true');
          }
        });
      }

      // Сохраняем успешно выполненные квесты (кроме квеста 6, он обработан выше)
      data.completed_quests.forEach(quest => {
        if (quest.quest_id !== 6) {
        localStorage.setItem(`quest_${quest.quest_id}_completed`, 'true');
          localStorage.setItem(`quest_${quest.quest_id}_points`, (quest.points || 0).toString());
          if (quest.message) {
        localStorage.setItem(`quest_${quest.quest_id}_message`, quest.message);
          }
        }
      });

      // Сохраняем неудачные квесты (кроме квеста 6, он обработан выше)
      data.failed_quests.forEach(quest => {
        if (quest.quest_id !== 6) {
        localStorage.setItem(`quest_${quest.quest_id}_failed`, 'true');
          if (quest.message) {
        localStorage.setItem(`quest_${quest.quest_id}_message`, quest.message);
          }
        }
      });

      // Сохраняем общее количество очков
      if (data.total_points) {
        // Если очки изменились, очищаем результаты верификации
        if (previousPoints !== data.total_points.toString()) {
          localStorage.removeItem('verification_result');
          localStorage.removeItem('vk');
          localStorage.removeItem('public_values');
        }
      localStorage.setItem('total_points', data.total_points.toString());
      }
      
      setSnackbar({
        open: true,
        message: (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
              Congratulations! You've earned {data.total_points || 0} points! Check the status of each quest.
            </Typography>
            {localStorage.getItem('verification_result') && (
              <Box sx={{ 
                mt: 1,
                p: 1.5, 
                borderRadius: 1,
                bgcolor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: '#69C9FF' }}>
                  Verification Result:
                </Typography>
                {localStorage.getItem('verification_result')}
              </Box>
            )}
            {localStorage.getItem('vk') && (
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 1,
                bgcolor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: '#FF1B8D' }}>
                  VK:
                </Typography>
                {localStorage.getItem('vk')}
              </Box>
            )}
            {localStorage.getItem('public_values') && (
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 1,
                bgcolor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: '#4caf50' }}>
                  Public Values:
                </Typography>
                {(() => {
                  const publicValues = localStorage.getItem('public_values');
                  if (!publicValues) return '';
                  try {
                    // Функция для конвертации hex строки в массив чисел (32-битные числа)
                    const fromHexString = (hexString) => {
                      // Убираем префикс "0x" если есть
                      const cleanHex = hexString.replace('0x', '');
                      
                      // Создаем массив для хранения 32-битных чисел
                      const numbers = [];
                      
                      // Обрабатываем каждые 8 символов (4 байта) как одно 32-битное число
                      for (let i = 0; i < cleanHex.length; i += 8) {
                        const chunk = cleanHex.slice(i, i + 8);
                        if (chunk.length === 8) {
                          // Конвертируем hex в число
                          const value = parseInt(chunk, 16);
                          numbers.push(value);
                        }
                      }
                      
                      return numbers;
                    };

                    // Конвертируем строку в числа
                    const numbers = fromHexString(publicValues);
                    
                    // Находим ненулевые значения и их позиции
                    const nonZeroValues = [];
                    numbers.forEach((value, index) => {
                      if (value !== 0) {
                        nonZeroValues.push(`[pos ${index}]: ${value}`);
                      }
                    });

                    return nonZeroValues.length > 0 
                      ? `Found non-zero values: ${nonZeroValues.join(', ')}`
                      : 'No non-zero values found';
                  } catch (error) {
                    console.error('Error decoding values:', error);
                    return 'Error decoding hex values';
                  }
                })()}
              </Box>
            )}
          </Box>
        ),
        severity: 'success'
      });

      // Обновляем состояние компонента для перерисовки
      setQuests([...quests]);
    } catch (error) {
      console.error('Error submitting answers:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while submitting answers. Please try again later.',
        severity: 'error'
      });
    } finally {
      // Небольшая задержка перед сбросом состояния загрузки
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const getCurrentQuestion = () => {
    if (!selectedQuest) return null;
    if (selectedQuest.questions) {
      return selectedQuest.questions[activeQuestion];
    }
    return { text: selectedQuest.question, answer: selectedQuest.answer };
  };

  const isQuestCompleted = (questId) => {
    return localStorage.getItem(`quest_${questId}_completed`) === 'true';
  };

  const isQuestFailed = (questId) => {
    return localStorage.getItem(`quest_${questId}_failed`) === 'true';
  };

  const getQuestMessage = (questId) => {
    return localStorage.getItem(`quest_${questId}_message`);
  };

  // Функция для получения текста награды
  const getRewardText = (points) => {
    const totalPoints = parseInt(points) || 0;
    if (totalPoints >= 100) {
      return {
        title: "🌟 Legendary Achievement!",
        message: "You've mastered SP1 completely! Your dedication and skill are truly remarkable. You're now ready to take on any blockchain challenge that comes your way!"
      };
    } else if (totalPoints >= 70) {
      return {
        title: "🏆 Outstanding Progress!",
        message: "You're showing exceptional understanding of SP1! Keep pushing forward, you're very close to complete mastery!"
      };
    } else if (totalPoints >= 40) {
      return {
        title: "🎯 Great Progress!",
        message: "You're making solid progress with SP1! You've grasped the core concepts and are well on your way to becoming an expert."
      };
    } else if (totalPoints >= 20) {
      return {
        title: "👍 Good Start!",
        message: "You're off to a promising start with SP1! Keep learning and practicing, you're on the right track."
      };
    } else {
      return {
        title: "🌱 Beginning Your Journey",
        message: "Every expert was once a beginner. Keep working on the quests, and you'll see your knowledge grow!"
      };
    }
  };

  // Функция для получения фонового изображения в зависимости от очков
  const getBackgroundImage = (points) => {
    const totalPoints = parseInt(points) || 0;
    if (totalPoints >= 100) return background5;
    if (totalPoints >= 70) return background4;
    if (totalPoints >= 40) return background3;
    if (totalPoints >= 20) return background2;
    return background1;
  };

  // Функция для открытия диалога наград
  const handleRewardClick = () => {
    setRewardDialogOpen(true);
  };

  const handleClearAnswers = () => {
    // Очищаем все ответы и статусы из localStorage
    quests.forEach(quest => {
      localStorage.removeItem(`quest_${quest.id}_answers`);
      localStorage.removeItem(`quest_${quest.id}_completed`);
      localStorage.removeItem(`quest_${quest.id}_failed`);
      localStorage.removeItem(`quest_${quest.id}_points`);
      localStorage.removeItem(`quest_${quest.id}_message`);
      
      // Очищаем статусы подвопросов для квеста 6
      if (quest.id === 6) {
        localStorage.removeItem('quest_6_completed');
        localStorage.removeItem('quest_6_failed');
        localStorage.removeItem('quest_6_partial');
        for (let i = 1; i <= 3; i++) {
          localStorage.removeItem(`quest_6_sub_${i}_correct`);
          localStorage.removeItem(`quest_6_sub_${i}_wrong`);
        }
      }
    });
    
    // Очищаем общее количество очков и дополнительные поля
    localStorage.removeItem('total_points');
    localStorage.removeItem('verification_result');
    localStorage.removeItem('vk');
    localStorage.removeItem('public_values');
    localStorage.removeItem('last_proved_points');
    
    // Обновляем состояние компонента
    setAnswers([]);
    setQuests([...quests]);
    
    // Показываем уведомление
    setSnackbar({
      open: true,
      message: 'All answers have been cleared',
      severity: 'info'
    });
    
    // Закрываем диалог подтверждения
    setClearDialogOpen(false);
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <style>{styles}</style>
      <Box 
        className={`theme-transition ${isDarkMode ? 'dark-theme' : 'light-theme'}`}
        sx={{
          minHeight: '100vh',
          background: `url(${background})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backdropFilter: 'blur(10px)',
            zIndex: 0
          }
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            py: 4,
            position: 'relative',
            zIndex: 1
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4,
            position: 'relative',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            padding: '32px 40px',
            borderRadius: '16px',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minHeight: '100px'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <img 
                src={logo} 
                alt="Succinct Logo" 
                style={{ 
                  height: '40px',
                  width: 'auto',
                  filter: 'brightness(1.2)'
                }} 
              />
              <Typography 
                variant="h3" 
                component="h1" 
                className="cyberpunk-text"
                sx={{
                  background: `linear-gradient(45deg, #FFFFFF 30%, ${succinctColors.pink.main} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textTransform: 'uppercase',
                  position: 'relative',
                  fontSize: '2.2rem'
                }}
              >
                YOUR FIRST SP1 PROOF
              </Typography>
            </Box>

            <Typography 
              variant="h4" 
              sx={{ 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mx: 4
              }}
            >
              <span>Points:</span>
              <span style={{ 
                color: 'white',
                fontWeight: 'bold'
              }}>
                {localStorage.getItem('total_points') || '0'}
              </span>
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  onClick={handleRewardClick}
                  sx={{
                    background: `linear-gradient(45deg, ${succinctColors.pink.main}, ${succinctColors.blue.main})`,
                    color: 'white',
                    height: '32px',
                    px: 2,
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    width: '140px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      background: `linear-gradient(45deg, ${succinctColors.pink.dark}, ${succinctColors.blue.dark})`,
                    }
                  }}
                >
                  GetReward
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {!localStorage.getItem('vk') && (
                    <Button
                      variant="text"
                      onClick={async () => {
                        setIsProving(true);
                        try {
                          const points = parseInt(localStorage.getItem('total_points')) || 0;
                          const response = await fetch(process.env.REACT_APP_VERIFY_URL + '/generate-proof', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ points })
                          });
                          
                          if (!response.ok) {
                            throw new Error('Network response was not ok');
                          }
                          
                          const data = await response.json();
                          
                          if (data.success) {
                            setSnackbar({
                              open: true,
                              message: 'Score verified successfully! Your proof is valid.',
                              severity: 'success'
                            });
                            localStorage.setItem('verification_result', data.verification_result);
                            localStorage.setItem('vk', data.vk);
                            localStorage.setItem('public_values', data.public_values);
                          } else {
                            setSnackbar({
                              open: true,
                              message: 'Score verification failed. Please try again.',
                              severity: 'error'
                            });
                          }
                        } catch (error) {
                          console.error('Error verifying score:', error);
                          setSnackbar({
                            open: true,
                            message: 'Error connecting to verification server',
                            severity: 'error'
                          });
                        } finally {
                          setIsProving(false);
                        }
                      }}
                      disabled={isProving}
                      sx={{
                        color: 'white',
                        fontSize: '0.9rem',
                        textTransform: 'none',
                        width: '68px',
                        opacity: isProving ? 0.5 : 0.8,
                        position: 'relative',
                        '&:hover': {
                          opacity: isProving ? 0.5 : 1,
                          background: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      {isProving ? (
                        <CircularProgress
                          size={20}
                          sx={{
                            color: 'white',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-10px',
                            marginLeft: '-10px'
                          }}
                        />
                      ) : (
                        'Prove'
                      )}
                    </Button>
                  )}
                  <Button
                    variant="text"
                    onClick={() => setClearDialogOpen(true)}
                    sx={{
                      color: '#f44336',
                      fontSize: '0.9rem',
                      textTransform: 'none',
                      width: !localStorage.getItem('vk') ? '68px' : '140px',
                      opacity: 0.8,
                      '&:hover': {
                        opacity: 1,
                        background: 'rgba(244, 67, 54, 0.1)'
                      }
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>

              <IconButton 
                onClick={toggleTheme} 
                sx={{ 
                  p: 1,
                  width: '40px',
                  height: '40px',
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                {isDarkMode ? (
                  <Brightness7Icon sx={{ color: '#FFD700' }} />
                ) : (
                  <Brightness4Icon sx={{ color: '#69C9FF' }} />
                )}
              </IconButton>
            </Box>
          </Box>
          
          <Grid container spacing={4} sx={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center' }}>
            {quests.map((quest) => (
              <Grid item xs={12} sm={6} key={quest.id} sx={{ display: 'flex' }}>
                <Card 
                  className="quest-card"
                  sx={{ 
                    width: '100%',
                    maxWidth: '450px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      cursor: 'pointer',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    },
                    minHeight: '200px',
                    margin: '0 auto',
                    borderRadius: '12px',
                    position: 'relative',
                    ...(isQuestCompleted(quest.id) && quest.id !== 6 && {
                      border: '2px solid #4caf50',
                      '&::after': {
                        content: '"✓"',
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }
                    }),
                    ...(quest.id === 6 && localStorage.getItem('quest_6_partial') === 'true' && {
                      border: '2px solid #ffc107',
                      '&::after': {
                        content: '"⋯"',
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#ffc107',
                        color: 'white',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingBottom: '4px'
                      }
                    }),
                    ...(quest.id === 6 && localStorage.getItem('quest_6_failed') === 'true' && {
                      border: '2px solid #f44336',
                      '&::after': {
                        content: '"×"',
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#f44336',
                        color: 'white',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }
                    }),
                    ...(isQuestFailed(quest.id) && quest.id !== 6 && {
                      border: '2px solid #f44336',
                      '&::after': {
                        content: '"×"',
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#f44336',
                        color: 'white',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }
                    })
                  }}
                  onClick={() => handleClickOpen(quest)}
                >
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 4
                  }}>
                    <Box>
                      <Typography variant="h5" component="h2" gutterBottom sx={{ fontSize: '1.5rem' }}>
                        {quest.quest}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        Quest #{quest.id}
                        {(isQuestCompleted(quest.id) || isQuestFailed(quest.id) || (quest.id === 6 && localStorage.getItem('quest_6_partial') === 'true')) && (
                          <Tooltip title={getQuestMessage(quest.id)} placement="right">
                            <span style={{ 
                              marginLeft: '8px',
                              color: quest.id === 6 && localStorage.getItem('quest_6_partial') === 'true' ? '#ffc107' : 
                                     isQuestCompleted(quest.id) ? '#4caf50' : '#f44336',
                              cursor: 'help'
                            }}>
                              • {quest.id === 6 && localStorage.getItem('quest_6_partial') === 'true' ? 'Partially proved' : 
                                 isQuestCompleted(quest.id) ? 'Proved' : 'Failed'}
                            </span>
                          </Tooltip>
                        )}
                      </Typography>
                    </Box>
                    <Tooltip title={quest.description} placement="bottom" arrow>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mt: 2, 
                          fontSize: '1rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {truncateText(quest.description)}
                      </Typography>
                    </Tooltip>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            gap: 2,
            mt: 4,
            mb: 2
          }}>
            {isLoading ? (
              <Box sx={{ 
                position: 'relative', 
                width: '200px',
                height: '40px'
              }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: succinctColors.pink.main,
                      backgroundImage: `linear-gradient(45deg, 
                        ${succinctColors.pink.main} 25%, 
                        ${succinctColors.blue.main} 50%, 
                        ${succinctColors.pink.main} 75%
                      )`,
                      backgroundSize: '200% 100%',
                      animation: 'gradient 2s linear infinite',
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    mixBlendMode: 'difference'
                  }}
                >
                  {`${Math.round(progress)}%`}
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'row',
                  gap: 2,
                  justifyContent: 'center',
                  width: '100%',
            mb: 2
          }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSubmitAll}
              className="gradient-button"
              sx={{
                      width: '300px',
                fontSize: '1.1rem',
                py: 1.5,
                px: 4,
                borderRadius: '12px',
                background: 'rgba(40, 40, 40, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontWeight: 500,
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  background: 'rgba(50, 50, 50, 0.95)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
                },
                '&:active': {
                  transform: 'translateY(0)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Check my answers
            </Button>
                </Box>
                {localStorage.getItem('verification_result') && (
                  <Box sx={{ 
                    width: '100%',
                    maxWidth: '800px',
                    mx: 'auto',
                    mt: 3,
                    borderRadius: 2,
                    bgcolor: '#1E1E1E',
                    border: '1px solid #2D2D2D',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
                    overflow: 'hidden'
                  }}>
                    {/* Terminal Header */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 1,
                      bgcolor: '#2D2D2D',
                      borderBottom: '1px solid #3D3D3D'
                    }}>
                      <Box sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: '#FF5F57'
                      }} />
                      <Box sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: '#FFBD2E'
                      }} />
                      <Box sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: '#28C941'
                      }} />
                      <Typography sx={{
                        color: '#999',
                        fontSize: '0.8rem',
                        ml: 2
                      }}>
                        verification-results
                      </Typography>
          </Box>

                    {/* Terminal Content */}
                    <Box sx={{ 
                      p: 3,
                      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                      fontSize: '0.9rem',
                      color: '#FFF',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}>
                      <Box>
                        <Typography sx={{ 
                          color: '#69C9FF',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          '&::before': {
                            content: '"$"',
                            color: '#4CAF50'
                          }
                        }}>
                          Verification Result
                        </Typography>
                        <Typography sx={{ 
                          color: '#FFF',
                          pl: 2,
                          wordBreak: 'break-all',
                          lineHeight: 1.5
                        }}>
                          {localStorage.getItem('verification_result')}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ 
                          color: '#FF1B8D',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          '&::before': {
                            content: '"$"',
                            color: '#4CAF50'
                          }
                        }}>
                          VK
                        </Typography>
                        <Typography sx={{ 
                          color: '#FFF',
                          pl: 2,
                          wordBreak: 'break-all',
                          lineHeight: 1.5
                        }}>
                          {localStorage.getItem('vk')}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ 
                          color: '#4CAF50',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          '&::before': {
                            content: '"$"',
                            color: '#4CAF50'
                          }
                        }}>
                          Public Values
                        </Typography>
                        <Typography sx={{ 
                          color: '#FFF',
                          pl: 2,
                          wordBreak: 'break-all',
                          lineHeight: 1.5
                        }}>
                          {(() => {
                            const publicValues = localStorage.getItem('public_values');
                            if (!publicValues) return '';
                            try {
                              // Функция для конвертации hex строки в массив чисел (32-битные числа)
                              const fromHexString = (hexString) => {
                                // Убираем префикс "0x" если есть
                                const cleanHex = hexString.replace('0x', '');
                                
                                // Создаем массив для хранения 32-битных чисел
                                const numbers = [];
                                
                                // Обрабатываем каждые 8 символов (4 байта) как одно 32-битное число
                                for (let i = 0; i < cleanHex.length; i += 8) {
                                  const chunk = cleanHex.slice(i, i + 8);
                                  if (chunk.length === 8) {
                                    // Конвертируем hex в число
                                    const value = parseInt(chunk, 16);
                                    numbers.push(value);
                                  }
                                }
                                
                                return numbers;
                              };

                              // Конвертируем строку в числа
                              const numbers = fromHexString(publicValues);
                              
                              // Находим ненулевые значения и их позиции
                              const nonZeroValues = [];
                              numbers.forEach((value, index) => {
                                if (value !== 0) {
                                  nonZeroValues.push(`[pos ${index}]: ${value}`);
                                }
                              });

                              return nonZeroValues.length > 0 
                                ? `Found non-zero values: ${nonZeroValues.join(', ')}`
                                : 'No non-zero values found';
                            } catch (error) {
                              console.error('Error decoding values:', error);
                              return 'Error decoding hex values';
                            }
                          })()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* macOS Dock - теперь справа */}
          <Box
            sx={{
              position: 'fixed',
              right: 110,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              background: isDarkMode ? 'rgba(28, 28, 28, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(12px)',
              padding: '12px',
              borderRadius: '16px',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
              zIndex: 10,
              transition: 'all 0.3s ease',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            {quests.map((quest) => (
              <Box
                key={quest.id}
                onClick={() => handleClickOpen(quest)}
                sx={{
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    transform: 'translateX(-8px) scale(1.1)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                    '& .quest-number': {
                      opacity: 1,
                      transform: 'translateX(0)'
                    }
                  },
                  ...(isQuestCompleted(quest.id) && quest.id !== 6 && {
                    border: '2px solid #4caf50',
                    '&::after': {
                      content: '"✓"',
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }
                  }),
                  ...(quest.id === 6 && localStorage.getItem('quest_6_partial') === 'true' && {
                    border: '2px solid #ffc107',
                    '&::after': {
                      content: '"⋯"',
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#ffc107',
                      color: 'white',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingBottom: '2px'
                    }
                  }),
                  ...(quest.id === 6 && localStorage.getItem('quest_6_failed') === 'true' && {
                    border: '2px solid #f44336',
                    '&::after': {
                      content: '"×"',
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#f44336',
                      color: 'white',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }
                  }),
                  ...(isQuestFailed(quest.id) && quest.id !== 6 && {
                    border: '2px solid #f44336',
                    '&::after': {
                      content: '"×"',
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#f44336',
                      color: 'white',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }
                  })
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                    fontWeight: 600
                  }}
                >
                  {quest.id}
                </Typography>
                <Typography
                  className="quest-number"
                  sx={{
                    position: 'absolute',
                    left: -120,
                    transform: 'translateX(4px)',
                    opacity: 0,
                    transition: 'all 0.3s ease',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {quest.quest}
                  {(isQuestCompleted(quest.id) || isQuestFailed(quest.id) || (quest.id === 6 && localStorage.getItem('quest_6_partial') === 'true')) && (
                    <span style={{ 
                      color: quest.id === 6 && localStorage.getItem('quest_6_partial') === 'true' ? '#ffc107' : 
                             isQuestCompleted(quest.id) ? '#4caf50' : '#f44336',
                      fontSize: '0.7rem'
                    }}>
                      • {quest.id === 6 && localStorage.getItem('quest_6_partial') === 'true' ? 'Partially proved' : 
                         isQuestCompleted(quest.id) ? 'Proved' : 'Failed'}
                    </span>
                  )}
                </Typography>
              </Box>
            ))}
          </Box>
          {/* Points Scale */}
          <Box
            sx={{
              position: 'fixed',
              right: 40,
              top: '50%',
              transform: 'translateY(-50%)',
              height: '600px',
              width: '60px',
              bgcolor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: isDarkMode ? 'rgba(80, 75, 75, 0.77)' : 'rgb(0, 0, 0)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 0',
              zIndex: 10,
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '0px',
                left: 0,
                right: 0,
                height: `calc(${(parseInt(localStorage.getItem('total_points')) || 0)}% )`,
                background: `linear-gradient(180deg, 
                  ${succinctColors.pink.main} 0%, 
                  ${succinctColors.blue.main} 100%)`,
                transition: 'height 0.3s ease',
                opacity: 0.8,
                zIndex: -1
              }
            }}
          >
            {/* Scale Line */}
            <Box
              sx={{
                height: '100%',
                width: '2px',
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                position: 'relative'
              }}
            >
              {/* Points Markers */}
              {[100, 70, 40, 20, 0].map((points) => {
                const currentPoints = parseInt(localStorage.getItem('total_points')) || 0;
                const isActive = currentPoints >= points;
                
                return (
                  <Box
                    key={points}
                    sx={{
                      position: 'absolute',
                      bottom: `calc(${(points/100) * 100}% - 1px)`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '16px',
                      height: '2px',
                      bgcolor: isActive ? 
                        `linear-gradient(90deg, ${succinctColors.pink.main}, ${succinctColors.blue.main})` : 
                        (isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'),
                      '&::after': {
                        content: `"${points}"`,
                        position: 'absolute',
                        left: '10px',
                        top: '-10px',
                        color: isActive ?
                          (points === 100 ? '#4caf50' :
                           points === 70 ? '#2196f3' :
                           points === 40 ? '#ff9800' :
                           points === 20 ? '#f44336' : '#757575') :
                          (isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'),
                        fontSize: '0.8rem',
                        fontWeight: isActive ? 'bold' : 'normal',
                        whiteSpace: 'nowrap',
                        textAlign: 'right',
                        width: '20px'
                      }
                    }}
                  />
                );
              })}
              
              {/* Current Points Indicator */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: `calc(${(parseInt(localStorage.getItem('total_points')) || 0)}% - 6px)`,
                  left: '50%',
                  transform: 'translate(-50%, 50%)',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, ${succinctColors.pink.main}, ${succinctColors.blue.main})`,
                  border: '2px solid',
                  borderColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                  boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease'
                }}
              />
            </Box>
          </Box>
          

          <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '16px',
                background: isDarkMode ? '#1a1a1a' : '#ffffff',
                backgroundImage: 'none',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                overflow: 'hidden'
              }
            }}
          >
            <DialogTitle 
              sx={{ 
                background: isDarkMode 
                  ? 'linear-gradient(to right, #2c2c2c, #1a1a1a)'
                  : 'linear-gradient(to right, #f5f5f5, #ffffff)',
                borderBottom: '1px solid',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1.5,
                px: 3,
                '& .MuiIconButton-root': {
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  '&:hover': {
                    background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  onClick={handleClose}
                  sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#ff5f57',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      filter: 'brightness(0.9)'
                    }
                  }}
                />
                <Box
                  sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#ffbd2e'
                  }}
                />
                <Box
                  sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#28c941'
                  }}
                />
                <Typography 
                  variant="h6" 
                  component="div"
                  sx={{ 
                    ml: 2,
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)'
                  }}
                >
                  {selectedQuest?.quest}
                </Typography>
              </Box>
              <IconButton 
                onClick={handleClose} 
                size="small"
                sx={{
                  display: 'none' // Скрываем оригинальную кнопку закрытия
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ p: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom
                  sx={{
                    color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                    fontWeight: 500
                  }}
                >
                  Instructions:
                </Typography>
                <List sx={{ 
                  bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  borderRadius: 2,
                  p: 2,
                  mb: 3
                }}>
                  {selectedQuest?.instructions.map((instruction, index) => (
                    <ListItem key={index} sx={{ px: 2, py: 0.5 }}>
                      <ListItemText 
                        primary={instruction}
                        primaryTypographyProps={{
                          sx: { 
                            color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                            fontSize: '0.95rem'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                {selectedQuest?.questions && (
                  <Box sx={{ width: '100%', mb: 4 }}>
                    <Stepper 
                      nonLinear 
                      activeStep={activeQuestion}
                      sx={{
                        '& .MuiStepButton-root': {
                          padding: '8px',
                          borderRadius: '8px',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                          }
                        },
                        '& .MuiStepIcon-root': {
                          color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                          '&.Mui-active': {
                            color: succinctColors.pink.main
                          }
                        }
                      }}
                    >
                      {selectedQuest.questions.map((_, index) => {
                        const isCorrect = selectedQuest.id === 6 && 
                          localStorage.getItem(`quest_6_sub_${index + 1}_correct`) === 'true';
                        const isWrong = selectedQuest.id === 6 && 
                          localStorage.getItem(`quest_6_sub_${index + 1}_wrong`) === 'true';
                        
                        return (
                        <Step key={index}>
                          <StepButton 
                            onClick={() => setActiveQuestion(index)}
                            completed={Boolean(answers[index])}
                              sx={{
                                '& .MuiStepLabel-root': {
                                  borderLeft: selectedQuest.id === 6 ? '3px solid' : 'none',
                                  borderColor: isCorrect ? '#4caf50' : 
                                             isWrong ? '#f44336' : 
                                             'transparent',
                                  pl: selectedQuest.id === 6 ? 1 : 0
                                },
                                '& .MuiStepIcon-root': {
                                  color: isCorrect ? '#4caf50' : 
                                         isWrong ? '#f44336' : 
                                         isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                                }
                              }}
                            >
                              <Box>
                            {answers[index] && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  maxWidth: '100px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                      fontSize: '0.8rem',
                                      color: isCorrect ? '#4caf50' : 
                                             isWrong ? '#f44336' : 
                                             'inherit'
                                }}
                              >
                                {answers[index]}
                                    {selectedQuest.id === 6 && (
                                      <span style={{ 
                                        marginLeft: '8px',
                                        color: isCorrect ? '#4caf50' : 
                                               isWrong ? '#f44336' : 
                                               'inherit'
                                      }}>
                                        {isCorrect ? '✓' : isWrong ? '×' : ''}
                                      </span>
                                    )}
                              </Typography>
                            )}
                              </Box>
                          </StepButton>
                        </Step>
                        );
                      })}
                    </Stepper>
                  </Box>
                )}

                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }}
                >
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{
                      color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
                      fontSize: '1rem',
                      lineHeight: 1.6
                    }}
                  >
                    {getCurrentQuestion()?.text}
                  </Typography>

                  <TextField
                    fullWidth
                    label="Your Answer"
                    variant="outlined"
                    value={answers[activeQuestion] || ''}
                    onChange={handleAnswerChange}
                    sx={{ 
                      mt: 2,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: succinctColors.pink.main
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                      },
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
                      }
                    }}
                  />

                  {result && (
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mt: 2, 
                        color: result.correct ? '#4caf50' : '#f44336',
                        fontWeight: 500
                      }}
                    >
                      {result.message}
                    </Typography>
                  )}
                </Paper>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mt: 3,
                  gap: 2
                }}>
                  {selectedQuest?.questions?.length > 1 ? (
                    <>
                      <Button
                        onClick={() => setActiveQuestion(Math.max(0, activeQuestion - 1))}
                        disabled={activeQuestion === 0}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                          color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                          '&:hover': {
                            bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                          }
                        }}
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => setActiveQuestion(Math.min(selectedQuest.questions.length - 1, activeQuestion + 1))}
                        disabled={activeQuestion === selectedQuest.questions.length - 1}
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                          '&:hover': {
                            bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                          }
                        }}
                      >
                        Next
                      </Button>
                    </>
                  ) : null}
                </Box>
              </Box>
            </DialogContent>
          </Dialog>

          <Dialog
            open={rewardDialogOpen}
            onClose={() => setRewardDialogOpen(false)}
            onClick={(e) => {
              // Закрываем при клике на задний фон (не на контент)
              if (e.target === e.currentTarget) {
                setRewardDialogOpen(false);
              }
            }}
            PaperProps={{
              sx: {
                borderRadius: '24px',
                background: 'none',
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                maxWidth: '1200px',
                width: '95%',
                height: '800px',
                position: 'relative',
                overflow: 'hidden'
              }
            }}
          >
            {/* macOS-style title bar */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40px',
                background: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                px: 3,
                zIndex: 4
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Box
                  onClick={() => setRewardDialogOpen(false)}
                  sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#ff5f57',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: '#ff5f57',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#450d0a',
                      '&::before': {
                        content: '"×"',
                        lineHeight: 1,
                        marginTop: '-1px'
                      }
                    }
                  }}
                />
                <Box
                  sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#ffbd2e',
                    cursor: 'default'
                  }}
                />
                <Box
                  sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#28c941',
                    cursor: 'default'
                  }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${getBackgroundImage(localStorage.getItem('total_points'))})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 0
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: isDarkMode ? 
                    'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))' : 
                    'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.5))',
                  zIndex: 1
                }
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '700px',
                height: '700px',
                backgroundImage: `url(${eva})`,
                backgroundSize: 'contain',
                backgroundPosition: 'bottom center',
                backgroundRepeat: 'no-repeat',
                zIndex: 2
              }}
            />
            <DialogContent 
              sx={{ 
                p: 8, 
                pt: 10,
                position: 'relative', 
                zIndex: 3,
                '&::-webkit-scrollbar': {
                  display: 'none'
                },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ textAlign: 'center', mb: '560px' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    mb: 4,
                    background: `linear-gradient(45deg, ${succinctColors.pink.main}, ${succinctColors.blue.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    fontSize: '2.5rem'
                  }}
                >
                  {getRewardText(localStorage.getItem('total_points')).title}
                </Typography>
                <Typography 
                  variant="h6"
                  sx={{ 
                    color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
                    lineHeight: 1.6,
                    textShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
                    fontSize: '1.5rem'
                  }}
                >
                  {getRewardText(localStorage.getItem('total_points')).message}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 6, position: 'relative', zIndex: 3 }}>
              <Button 
                onClick={() => setRewardDialogOpen(false)}
                sx={{
                  background: `linear-gradient(45deg, ${succinctColors.pink.main}, ${succinctColors.blue.main})`,
                  color: 'white',
                  px: 6,
                  py: 2,
                  borderRadius: '12px',
                  fontSize: '1.2rem',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${succinctColors.pink.dark}, ${succinctColors.blue.dark})`,
                  }
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Диалог подтверждения очистки */}
          <Dialog
            open={clearDialogOpen}
            onClose={() => setClearDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: '16px',
                background: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                minWidth: '400px'
              }
            }}
          >
            <DialogContent sx={{ pt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                Are you sure?
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'center', color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                This will clear all your answers and progress.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
              <Button
                onClick={() => setClearDialogOpen(false)}
                sx={{
                  px: 3,
                  borderRadius: '8px',
                  color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  '&:hover': {
                    background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleClearAnswers}
                sx={{
                  px: 3,
                  borderRadius: '8px',
                  color: '#f44336',
                  '&:hover': {
                    background: 'rgba(244,67,54,0.1)'
                  }
                }}
              >
                Clear all
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar 
            open={snackbar.open} 
            autoHideDuration={6000} 
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{
              '& .MuiSnackbarContent-root': {
                bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                '& .MuiAlert-message': {
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'
                }
              }
            }}
          >
            <Alert 
              onClose={() => setSnackbar({ ...snackbar, open: false })} 
              severity={snackbar.severity}
              sx={{ 
                width: '100%',
                bgcolor: 'transparent',
                '& .MuiAlert-icon': {
                  color: snackbar.severity === 'success' ? '#4caf50' : 
                         snackbar.severity === 'error' ? '#f44336' : 
                         snackbar.severity === 'warning' ? '#ffc107' : '#2196f3'
                }
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>

          {/* Add Fake Text File */}
          <Box
            onClick={() => setShowMessage(true)}
            sx={{
              position: 'fixed',
              left: 20,
              top: '30%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              transition: 'all 0.2s',
              zIndex: 10,
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            {/* File Icon */}
            <Box sx={{
              width: 60,
              height: 72,
              bgcolor: '#fff',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '20px',
                height: '20px',
                bgcolor: '#fff',
                borderRadius: '0 0 0 8px'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '20px',
                height: '20px',
                bgcolor: '#f0f0f0',
                borderRadius: '0 8px 0 8px'
              }
            }}>
              <Typography sx={{ 
                fontSize: '0.7rem', 
                color: '#666',
                zIndex: 1,
                fontWeight: 'bold'
              }}>
                TXT
              </Typography>
            </Box>
            
            {/* File Name */}
            <Typography sx={{
              fontSize: '0.8rem',
              color: isDarkMode ? '#fff' : '#000',
              textAlign: 'center',
              maxWidth: 80,
              wordBreak: 'break-word'
            }}>
              answers.txt
            </Typography>
          </Box>

          {/* Message Dialog */}
          <Dialog
            open={showMessage}
            onClose={() => setShowMessage(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '10px',
                bgcolor: '#1E1E1E',
                minWidth: '600px',
                overflow: 'hidden'
              }
            }}
          >
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              bgcolor: '#2D2D2D',
              borderBottom: '1px solid #3D3D3D'
            }}>
              <Box 
                onClick={() => setShowMessage(false)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: '#FF5F57',
                  cursor: 'pointer',
                  '&:hover': {
                    filter: 'brightness(0.9)'
                  }
                }}
              />
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#FFBD2E'
              }} />
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#28C941'
              }} />
              <Typography sx={{
                color: '#999',
                fontSize: '0.8rem',
                ml: 2
              }}>
                answers.txt
              </Typography>
            </Box>
            <Box sx={{
              position: 'relative',
              width: '100%',
              height: '500px',
            }}>
              <Box
                component="img"
                src={ost}
                alt="ost"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <Typography sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#FFF',
                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                fontSize: '2rem',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                zIndex: 2,
                textAlign: 'center',
                width: '100%'
              }}>
                Got u lol
              </Typography>
            </Box>
          </Dialog>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
