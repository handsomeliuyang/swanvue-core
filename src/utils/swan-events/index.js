/**
 * @file swan-events/index.js
 */
import EventsEmitter from '../events-emitter';
const global = window;
global.swanEvents = global.swanEvents || new EventsEmitter();

export default function (eventName, data){
    global.swanEvents.fireMessage({
        type: 'TraceEvents',
        params: {
            eventName,
            data
        }
    });
}
