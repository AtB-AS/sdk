import { Departure } from '../fields/Departure'
import { Notice } from '../fields/Notice'
import { Place } from '../fields/Place'
import { ServiceJourney } from '../fields/ServiceJourney'
import { Situation } from '../fields/Situation'

import { uniqBy } from '../utils'

export interface LegWithDepartures {
    aimedStartTime: string
    expectedStartTime: string
    fromEstimatedCall?: Departure
    fromPlace: Place
    realtime: boolean
    serviceJourney: ServiceJourney
    situations: Situation[]
}

function getNoticesFromLeg(leg: LegWithDepartures): Notice[] {
    const notices = [
        ...(leg.serviceJourney?.notices || []),
        ...(leg.serviceJourney?.journeyPattern?.notices || []),
        ...(leg.serviceJourney?.journeyPattern?.line?.notices || []),
        ...(leg.fromEstimatedCall?.notices || []),
    ]
    return uniqBy(notices, (notice) => notice.text)
}

function getNotices(departure: Departure): Notice[] {
    const notices = [
        ...(departure.notices || []),
        ...(departure.serviceJourney?.notices || []),
        ...(departure.serviceJourney?.journeyPattern?.notices || []),
        ...(departure.serviceJourney?.journeyPattern?.line?.notices || []),
    ]
    return uniqBy(notices, (notice) => notice.text)
}

export function destinationMapper(departure: Departure): Departure {
    return {
        ...departure,
        notices: getNotices(departure),
    }
}

export function legToDepartureMapper(
    leg: LegWithDepartures,
): Departure | undefined {
    const { fromEstimatedCall } = leg

    if (!fromEstimatedCall) return undefined

    return {
        actualArrivalTime: fromEstimatedCall.actualArrivalTime,
        actualDepartureTime: fromEstimatedCall.actualDepartureTime,
        aimedArrivalTime: fromEstimatedCall.aimedArrivalTime,
        aimedDepartureTime: leg.aimedStartTime,
        cancellation: fromEstimatedCall.cancellation,
        date: fromEstimatedCall.date,
        destinationDisplay: fromEstimatedCall.destinationDisplay,
        expectedArrivalTime: fromEstimatedCall.expectedArrivalTime,
        expectedDepartureTime: leg.expectedStartTime,
        forAlighting: fromEstimatedCall.forAlighting,
        forBoarding: fromEstimatedCall.forBoarding,
        notices: getNoticesFromLeg(leg),
        predictionInaccurate: fromEstimatedCall.predictionInaccurate,
        quay: leg.fromPlace.quay,
        realtime: leg.realtime,
        requestStop: fromEstimatedCall.requestStop,
        serviceJourney: leg.serviceJourney,
        situations: leg.situations || [],
    }
}
