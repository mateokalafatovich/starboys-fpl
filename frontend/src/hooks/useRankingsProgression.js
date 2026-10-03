import { useQuery } from '@tanstack/react-query';
import api from '../api';

export default function useRankingsProgression() {
    const { data, isPending, error } = useQuery({
        queryKey: ['rankingsProgression'],
        queryFn: async () => {
            const response = await api.get('/league/rankings/progression');
            return response.data;
        },
    });

    return { data, loading: isPending, error };
}
