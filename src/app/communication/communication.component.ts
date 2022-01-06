import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommunicationMessage, CommunicationService, MsgType} from "../services/communication.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-communication',
  templateUrl: './communication.component.html',
  styleUrls: ['./communication.component.scss']
})
export class CommunicationComponent implements OnInit, OnDestroy {
  errorType = MsgType.ERROR
  successType = MsgType.SUCCESS

  messageQueue: CommunicationMessage[] = []
  private onMessageSubscription: Subscription | null = null;

  constructor(private communicationService: CommunicationService) { }

  ngOnInit(): void {
    this.onMessageSubscription = this.communicationService.onMessage
      .subscribe(msg => this.messageQueue.push(msg))

    this.repeatedlyClearMessageQueue();
  }

  private repeatedlyClearMessageQueue() {
    const currentTimeMs = new Date().getTime()
    this.messageQueue = this.messageQueue.filter(msg => msg.timestampMs + msg.durationMs >= currentTimeMs)
    setTimeout(() => this.repeatedlyClearMessageQueue(), 500)
  }

  ngOnDestroy(): void {
    if (this.onMessageSubscription) {
      this.onMessageSubscription.unsubscribe();
    }
  }

  closeAlert(message: CommunicationMessage) {
    this.messageQueue = this.messageQueue.filter(msg => msg.timestampMs !== message.timestampMs)
  }

  getMsgLabel(message: CommunicationMessage) {
    switch (message.type) {
      case MsgType.SUCCESS:
        return "Sukces!"
      case MsgType.INFO:
        return "Info"
      case MsgType.WARN:
        return "Uwaga!"
      case MsgType.ERROR:
        return "Błąd!"
    }
  }
}
