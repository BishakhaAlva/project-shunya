import { useReducer, useCallback } from 'react';
import type { BuildingKey } from '@/game/types';
import { createInitialState, gameReducer } from '@/game/engine';
import LandingScreen from '@/screens/LandingScreen';
import BriefingScreen from '@/screens/BriefingScreen';
import GameScreen from '@/screens/GameScreen';
import ExploreScreen from '@/screens/ExploreScreen';
import ReportScreen from '@/screens/ReportScreen';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

  const handleStart = useCallback(() => dispatch({ type: 'START_GAME' }), []);
  const handleBegin = useCallback(() => dispatch({ type: 'SET_SCREEN', screen: 'game' }), []);
  const handleBack = useCallback(() => dispatch({ type: 'SET_SCREEN', screen: 'landing' }), []);
  const handleBuild = useCallback(
    (building: BuildingKey) => dispatch({ type: 'BUILD', building }),
    []
  );
  const handleAdvanceDay = useCallback(() => dispatch({ type: 'ADVANCE_DAY' }), []);
  const handleResolveEvent = useCallback(
    (choiceIndex: number) => dispatch({ type: 'RESOLVE_EVENT', choiceIndex }),
    []
  );
  const handleExplore = useCallback(() => dispatch({ type: 'SET_SCREEN', screen: 'explore' }), []);
  const handleExploreBack = useCallback(() => dispatch({ type: 'SET_SCREEN', screen: 'game' }), []);
  const handleRestart = useCallback(() => dispatch({ type: 'RESET_GAME' }), []);
  const handleHome = useCallback(() => dispatch({ type: 'RESET_GAME' }), []);

  switch (state.screen) {
    case 'landing':
      return <LandingScreen onStart={handleStart} />;
    case 'briefing':
      return <BriefingScreen onBegin={handleBegin} onBack={handleBack} />;
    case 'game':
      return (
        <GameScreen
          state={state}
          onBuild={handleBuild}
          onAdvanceDay={handleAdvanceDay}
          onResolveEvent={handleResolveEvent}
          onExplore={handleExplore}
        />
      );
    case 'explore':
      return <ExploreScreen state={state} onBack={handleExploreBack} />;
    case 'report':
      return <ReportScreen state={state} onRestart={handleRestart} onHome={handleHome} />;
    default:
      return <LandingScreen onStart={handleStart} />;
  }
}
