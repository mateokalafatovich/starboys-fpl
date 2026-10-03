import { useQuery } from '@tanstack/react-query';
import api from '../api';

export default function useStandingsProgression() {
    const { data, isPending, error } = useQuery({
        queryKey: ['standingsProgression'],
        queryFn: async () => {
            const response = await api.get('/league/standings/progression');
            return response.data;
        },
    });

    return { data, loading: isPending, error };
}
