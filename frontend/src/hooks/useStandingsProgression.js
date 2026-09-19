import { useState, useEffect } from 'react';
import api from '../api';

export const useStandingsProgression = (leagueId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/league/standings/progression`);
                setData(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [leagueId]);

    return { data, loading, error };
};