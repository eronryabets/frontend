import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Хук для использования dispatch с типами
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Хук для использования селекторов с типами
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;