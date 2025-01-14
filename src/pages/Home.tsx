import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ls from "../lib/storage";
import searchByDate, { Routine, searchActiveRoutine } from "../lib/dateMethods";
import Header from "../components/Header";
import getCurrentDate, { getEmojiOfDayByTime } from '../lib/date';
import TextEmoji from "../components/TextEmoji";
import LoadingRoutines from "../components/loading/LoadingRoutines";
import NewRoutinesLoader, { GetRoutines } from "./NewRoutinesLoader";
import FloatingButton from "../components/FloatingButton";
import Watermark from "../components/Watermark";
import NavBar from "../components/NavBar";
import BottomModal from "../components/BottomModal";


function Home() {
  const [screenRoutines, uTodayRoutine] = useState<any>([]);
  const navigate = useNavigate();
  const timer2 = useRef<any>(null);
  const [isRoutineEmpty, setIsRoutineEmpty] = useState(false);
  const routines = useMemo(() => JSON.parse(ls.get('routines') || '[]'), []);
  const [showLoading, setShowLoading] = useState(true);
  const topElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
     // Check if started using
     let timer: any = null;

     const startedUsing = ls.get('startedUsing');
     if (!startedUsing) {
        navigate('/start', { replace: true });
     }

     // Add index property to routines

     // If there is no routine show an alert message to go to routine store
     if (routines.length === 0) {
        timer = setTimeout(() => {
           // const ask = confirm('You have no routine. Do you want to go to routine store?')
           // if (ask) navigate('/apply-routine')
           setIsRoutineEmpty(true);
        }, 3000);
     }

     routines.forEach((routine: Routine, index: number) => {
        routine.index = index;
     });
     let todayRoutines: Routine[] = searchByDate(new Date(), routines);
     searchActiveRoutine(todayRoutines);
     uTodayRoutine(todayRoutines);

     timer2.current = setInterval(() => {
        todayRoutines = searchByDate(new Date(), routines);
        searchActiveRoutine(todayRoutines);
        uTodayRoutine(todayRoutines);
        console.log('Refresh');
     }, 60000);

     return () => {
        // clearTimeout(timer1.current)
        clearTimeout(timer2.current);
        timer && clearTimeout(timer);
     };
  }, []);

  useEffect(() => {
     // Disable loading after 1.5s
     const timer = setTimeout(() => {
        setShowLoading(false);
     }, 700);

     return () => {
        clearTimeout(timer);
     };
  }, [screenRoutines]);

  useEffect(() => {
     // Scroll to top
     topElement.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
     <div className='home-screen screen-navbar select-none dark:bg-black dark:text-darkText'>
        <div className='scrollToTop' ref={topElement}></div>
        <Header
           title={
              <span>
                 {getCurrentDate()} <TextEmoji emoji={getEmojiOfDayByTime()} />
              </span>
           }
           notiIcon={true}
           placeholder='Search Routine'
        />

        <section className='p-[1.2rem] pt-3'>
           {showLoading ? (
              <LoadingRoutines />
           ) : (
              <>
                 <div className='routines flex flex-col gap-[0.9rem]'>
                    <GetRoutines screenRoutines={screenRoutines} allRoutines={routines} />
                 </div>
                 <NewRoutinesLoader />
              </>
           )}
        </section>
        <FloatingButton />
        <Watermark />
        <NavBar active='Home' />
        <BottomModal
           show={isRoutineEmpty}
           btnTxt={[, 'Go to Store']}
           cb={[
              ,
              () => {
                 navigate('/applyRoutine');
              },
           ]}
        >
           <NoRoutineUi />
        </BottomModal>
     </div>
  );
}

function NoRoutineUi() {
   return (
      <>
         <p className='text-center text-xl font-semibold'>
            You have no Routine <TextEmoji emoji='😕' /> !
         </p>
         <div className='animate-bounce-slow mb-10 mt-10 grid'>
            <img src={Emoji.get('👜')} alt='bag' className={`place-1-1 mx-auto mt-5 h-28 w-28 opacity-50 blur-xl`} />
            <img src={Emoji.get('👜')} alt='bag' className={`place-1-1 z-10 mx-auto mt-5 h-28 w-28`} />
         </div>
         <p className='mt-5 text-center text-xs font-[450] text-grey'>
            Go to Routine <TextEmoji emoji='📃' /> Store <TextEmoji emoji='👜' /> <br />
            to add new Routines !
         </p>
      </>
   );
}