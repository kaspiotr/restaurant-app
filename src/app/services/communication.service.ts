import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  onMessage = new Subject<CommunicationMessage>();

  publishMessage(text: string, type: MsgType, durationMs: number = 2500) {
    this.onMessage.next({
      text: text,
      type: type,
      durationMs: durationMs,
      timestampMs: new Date().getTime()})
  }
}

export interface CommunicationMessage {
  type: MsgType
  text: string
  durationMs: number
  timestampMs: number
}

export enum MsgType {
  SUCCESS, INFO, WARN, ERROR
}
