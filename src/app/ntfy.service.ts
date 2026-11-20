import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NtfyService {
  // Subscribe to this exact topic in the ntfy app.
  readonly topic = 'petha-ankit-7m2x9q4v';

  send(event: string): void {
    const time = new Date().toLocaleString();

    void fetch(`https://ntfy.sh/${this.topic}`, {
      method: 'POST',
      headers: {
        'Title': 'Petha website activity',
        'Priority': 'high',
        'Tags': 'heart,sparkles'
      },
      body: `${event}\nTime: ${time}`,
      keepalive: true
    }).catch(() => {
      // Notifications should never interrupt the website experience.
    });
  }
}
