import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useInterview } from "./useInterview";

export const useAIConclusions=({interviewId}: { interviewId?: string }) =>{
    const queryKey = ['AI', 'Conclusions', interviewId];
    const [_status, setStatus] = useState<StepStatus>('pending');


    const { data: interview, isLoading: interviewLoading } = useInterview(interviewId)
    
    useEffect(() => {
        if (interviewLoading) {
            setStatus('loading-interview');
        }
    }, [interviewLoading]);

    const {data, status:_queryStatus, ...rest} = useQuery({
        queryKey,
        queryFn: () => queryFn(interviewId, setStatus),
        enabled: !!interviewId,
    });

    return {data, queryKey, status: _queryStatus, ...rest};
}


const queryFn = async (interviewId?: string, setStatus?: (status: StepStatus) => void) => {
    // TODO: Implement actual API call to fetch AI conclusions
    setStatus?.('getting-profile');
    // Get profile url from hook
    return interviewId;
}

type StepStatus = 'pending' | 'loading-interview' | 'getting-profile' | 'analyzing-profile' | 'generating-prompt' | 'generating-conclusion';