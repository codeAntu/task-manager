import Emoji from 'emoji-store';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import icons from '../assets/icons/icons';
import BackHeader from '../components/BackHeader';
import { MS_IN_DAY, day, emojiList, isStartTimeGreater, routineOptions } from '../lib/date';
import ls from '../lib/storage';
import TextEmoji from '../components/TextEmoji';
import BottomModal, { BasicModal } from '../components/BottomModal';
import { MODAL_BUTTON_TEXT, capitalize, parseEmoji } from '../lib/lib';
import { df } from '../lib/delay';
import { Routine } from '../lib/dateMethods';
import OptionSelector from '../components/OptionSelector';
import Once from './makeRoutine/Once';
import Weekly from './makeRoutine/Weekly';
import Daily from './makeRoutine/Daily';
import Calendar from './makeRoutine/Calendar';

function NewRoutine() {
   const e = new Emoji();
   const [routineName, setRoutineName] = useState('');
   const [routineDescription, setRoutineDescription] = useState('');
   const [routineEmoji, setRoutineEmoji] = useState('');
   const [routineType, setRoutineType] = useState('weekly');
   const [routine, setRoutine] = useState<any>(getBlankRoutine(routineType));
   const navigate = useNavigate();
   const topElement: any = useRef<HTMLDivElement>();
   const emojiInput = useRef<any>(null);
   const [isSelectorOpen, setIsSelectorOpen] = useState(false);
   const [routineTypeSelectedOption, setRoutineTypeSelectedOption] = useState();
   const [modalShow, setModalShow] = useState(false);
   const [modalBtnText, setModalBtnText] = useState(MODAL_BUTTON_TEXT);
   const [modalUi, setModalUi] = useState(<BasicModal text='THis is a sample error' />);
   const BLANK_MODAL_CB = useMemo(() => [() => setModalShow(false), () => setModalShow(false)], []);
   const [modalCallback, setModalCallback] = useState(BLANK_MODAL_CB);

   function setBlankAndShowModal() {
      setModalBtnText(MODAL_BUTTON_TEXT);
      setModalCallback(BLANK_MODAL_CB);
      setModalShow(true);
   }
   function getBlankRoutine(type: string) {
      if (type === 'once' || type === 'daily')
         return {
            name: routineName,
            description: routineDescription,
            emoji: routineEmoji,
            type: 'once',
            time: ['', ''],
            sub: '',
         };
      if (type === 'weekly')
         return {
            name: routineName,
            description: routineDescription,
            emoji: routineEmoji,
            type: 'weekly',
            time: {},
            sub: '',
         };
      if (type === 'calendar' || type === 'holiday')
         return {
            name: routineName,
            description: routineDescription,
            emoji: routineEmoji,
            type: 'calendar',
            time: [],
            sub: '',
         };
   }

   function goBack() {
      navigate(-1);
   }

   useEffect(() => {
      topElement.current.scrollIntoView({ behavior: 'smooth' });
   }, []);

   return (
      <div className='new-routine-screen screen select-none dark:text-darkText'>
         <BottomModal show={modalShow} btnTxt={modalBtnText} cb={modalCallback}>
            {modalUi}
         </BottomModal>

         <div className='topElement' ref={topElement}></div>
         <BackHeader
            title='New Routine'
            backCb={() => {
               setModalUi(
                  <BasicModal text='Discard this routine?' desc='Are you sure you want to discard this routine?' />,
               );
               setModalCallback([
                  () => setModalShow(false),
                  () => {
                     goBack();
                  },
               ]);
               setModalBtnText(["Don't", 'Discard']);
               setModalShow(true);
            }}
         />

         <section className='basic-details w-full p-4 pt-2'>
            <div className='flex min-h-[calc(100vh-100px)] w-full flex-col items-center justify-between'>
               <div className='top flex w-full flex-col gap-3'>
                  <div className='routine-name-and-display-emoji'>
                     <p className='text-secondary pb-1 pl-1 text-xs'>Routine name</p>
                     <div className='inputText flex flex-row gap-3'>
                        <img
                           src={Emoji.get(parseEmoji(routineEmoji)[0] || '🧑🏻')}
                           className='tap h-[3.5rem] rounded-2xl bg-inputBg p-[0.8rem] dark:bg-darkInputBg'
                        />
                        <input
                           value={routineName}
                           onInput={(e: any) => {
                              setRoutineName(e.target.value);
                           }}
                           type='text'
                           placeholder='Routine Name'
                           className='name input-text bg-inputBg dark:bg-darkInputBg'
                        />
                     </div>
                  </div>
                  <div className='routine-description inputText'>
                     <div className=''>
                        <p className='text-secondary pb-1 pl-1 text-xs'>Routine description</p>
                        <input
                           value={routineDescription}
                           onInput={(e: any) => {
                              setRoutineDescription(e.target.value);
                           }}
                           type='text'
                           placeholder='Routine Description'
                           className='name input-text bg-inputBg dark:bg-darkInputBg'
                        />
                     </div>
                  </div>
                  <div className='emoji-and-type'>
                     <p className='text-secondary pb-1 pl-1 text-xs'>Routine emoji and repetition</p>
                     <div className='inputSelect flex items-center justify-between gap-3'>
                        <input
                           type='text'
                           value={routineEmoji}
                           placeholder='Emoji'
                           className='name input-text flex-1 bg-inputBg dark:bg-darkInputBg'
                           onInput={(e: any) => {
                              setRoutineEmoji(parseEmoji(e.target.value)[0]);
                           }}
                           ref={emojiInput}
                        />
                        <div>
                           {
                              <OptionSelector
                                 heading='Routine Type'
                                 isOpen={isSelectorOpen}
                                 options={routineOptions}
                                 setOption={setRoutineType}
                                 setIsOpen={setIsSelectorOpen}
                              >
                                 <div
                                    className='tap99 trans-outline flex-[4] appearance-none rounded-2xl border-none bg-inputBg p-[1rem] px-7 text-center outline-none focus:outline-accent dark:bg-darkInputBg'
                                    onClick={df(() => {
                                       setIsSelectorOpen(true);
                                    })}
                                 >
                                    Routine : {capitalize(routineType)}
                                 </div>
                              </OptionSelector>
                           }
                           {/* 
									<select defaultValue={routineType} onInput={(e: any) => setRoutineType(e.target.value)}>
										<option value="once">Routine : Once</option>
										<option value="daily">Routine : Daily</option>
										<option value="weekly">Routine : Weekly</option>
										<option value="monthly">Routine : Monthly</option>
										<option value="yearly">Routine : Yearly</option>
										<option value="calendar">Calendar Event</option>
										<option value="holiday">Holiday</option>
									</select> */}
                        </div>
                        {/* <img src={e.get('➕')} className='tap bg-inputBg dark:bg-darkInputBg h-[3.5rem] p-[0.8rem] rounded-2xl' /> */}
                     </div>
                  </div>
                  <div className='emojis scrollbar-hidden flex flex-nowrap items-center justify-between gap-3 overflow-auto'>
                     {emojiList.map((emoji: string, index: number) => (
                        <img
                           src={e.get(emoji)}
                           onClick={() => setRoutineEmoji(emoji)}
                           className='tap h-[3.2rem] rounded-2xl bg-inputBg p-[0.8rem] dark:bg-darkInputBg'
                           key={index}
                        />
                     ))}
                     <p
                        className='tap flex aspect-square h-[3.2rem] items-center justify-center rounded-2xl  bg-inputBg p-[0.8rem] text-2xl dark:bg-darkInputBg'
                        onClick={() => {
                           emojiInput && emojiInput.current.focus();
                        }}
                     >
                        +
                     </p>
                  </div>
                  {RoutineMaker(routineType, routine)}
               </div>
               <div className='btn w-full'>
                  <button className='btn-full no-highlight tap99 w-full text-sm' onClick={addRoutine}>
                     Add this Routine
                  </button>
               </div>
            </div>
         </section>
      </div>
   );
   function addRoutine() {
      // validate routine
      setRoutineName(routineName.trim());
      setRoutineDescription(routineDescription.trim());
      if (!routineName) {
         setModalUi(<BasicModal text='Routine name is required' desc='Please provide a name for your routine' />);
         setBlankAndShowModal();
         return;
      }

      if (routineType === 'once') {
         if (!routine.time[0]) {
            setModalUi(<BasicModal text='Routine time is required' desc='Please provide a time for your routine' />);
            setBlankAndShowModal();
            return;
         }
         let startDate = new Date(routine.time[0]);
         let endDate = new Date(routine.time[1]);
         // If start time is greater than end time then return error
         if (startDate > endDate) {
            setModalUi(
               <BasicModal
                  text='Start time is greater than end time'
                  desc='Make sure that the start time is less than end time'
               />,
            );
            setBlankAndShowModal();
            return;
         }
         // If start and end time are same then remove the end time
         else if (startDate.getTime() === endDate.getTime()) routine.time[1] = '';
      } else if (routineType === 'daily') {
         if (!routine.time[0]) {
            <BasicModal text='Routine time is required' desc='Please provide a time for your routine' />;
            setBlankAndShowModal();
            return;
         }
         if (isStartTimeGreater(routine.time[0], routine.time[1])) {
            setModalUi(
               <BasicModal
                  text='Start time should be less than end time'
                  desc='Make sure that the start time is less than end time'
               />,
            );
            setBlankAndShowModal();
            return;
         }
      } else if (routineType === 'weekly') {
         let timeObj = routine.time;
         if (!timeObj) {
            setModalUi(
               <BasicModal
                  text='At least one Routine time is required'
                  desc='Please provide at least one time for your routine'
               />,
            );
            setBlankAndShowModal();
            return;
         }
         if (timeObj && Object.keys(timeObj).length === 0) {
            setModalUi(
               <BasicModal
                  text='At least one time should be selected'
                  desc='Please Select the day clicking on the boxes written days on it.'
               />,
            );
            setBlankAndShowModal();
            return;
         }

         // If there is a valid time then set the time to routine and if there is same time for start and end then remove the end time and if there is start time greater than end time return error
         const latestTimes: any = {};
         let atLeastOneExist = false;
         // Filter time array
         for (let i = 0; i < 7; i++) {
            const time = timeObj[i];
            if (time) {
               // if start time exist
               if (time[0]) {
                  latestTimes[i] = [];
                  latestTimes[i][0] = time[0];
                  atLeastOneExist = true;
                  if (time[1]) {
                     if (time[0] !== time[1]) {
                        // Check if start time is greater than end time
                        if (isStartTimeGreater(time[0], time[1])) {
                           setModalUi(
                              <BasicModal
                                 text={`Something wrong in the time of ${day[i]}`}
                                 desc='Make sure that the start time is less than end time'
                              />,
                           );
                           setBlankAndShowModal();
                           return;
                        } else latestTimes[i][1] = time[1];
                     }
                  } else {
                  }
               } else if (time[1]) {
                  setModalUi(
                     <BasicModal
                        text={`Something wrong in the time of ${day[i]}`}
                        desc='The start time must be provided if end time is provided'
                     />,
                  );
                  setBlankAndShowModal();
                  return;
               }
            }
         }
         if (!atLeastOneExist) {
            setModalUi(
               <BasicModal
                  text='At least one Routine time is required'
                  desc='Please provide at least one time for your routine'
               />,
            );
            setBlankAndShowModal();
            return;
         }
         routine.time = latestTimes;
      } else if (routineType === 'holiday' || routineType === 'calendar') {
         // Show warning it is the past time
         let routineTime = routine.time[0];
         if (!routineTime) {
            setModalUi(<BasicModal text='Please Select a date' desc='You have to select a date to continue' />);
            setBlankAndShowModal();
            return;
         }

         routineTime = new Date(routineTime).getTime();
         const now = Math.floor(Date.now() / MS_IN_DAY);
         routineTime = Math.floor(routineTime / MS_IN_DAY);

         if (now > routineTime) {
            setModalUi(
               <BasicModal text='Past Time!' desc='The time you provide is in past, Select a time that is in future' />,
            );
            setBlankAndShowModal();
            return;
         }
      }

      let newRoutine = {
         name: routineName,
         description: routineDescription,
         emoji: routineEmoji || '🧑🏻',
         type: routineType,
         sub: 'LOCAL',
         ...routine,
      };
      // return
      // Save routine to local storage
      let routines = JSON.parse(ls.get('routines') || '[]');
      routines.unshift(newRoutine);
      ls.set('routines', JSON.stringify(routines));
      navigate(-1);
   }

   function RoutineMaker(type: string, routine: Routine) {
      if (type === 'once') return <Once updateRoutine={setRoutine} routine={routine} />;
      if (type === 'weekly') return <Weekly updateRoutine={setRoutine} routine={routine} edit={false} />;
      else if (type === 'daily') return <Daily updateRoutine={setRoutine} routine={routine} />;
      else if (type === 'calendar' || type === 'holiday')
         return <Calendar type={type} updateRoutine={setRoutine} routine={routine} />;
      else
         return (
            <div className='mt-16 text-center'>
               <p>This screen is under development</p>
            </div>
         );
   }
}

export default NewRoutine;
