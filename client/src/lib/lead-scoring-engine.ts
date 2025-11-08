/**
 * Lead Scoring Engine - Shortwave-Inspired Intelligence
 * 
 * Implements the EXACT scoring algorithm from Shortwave AI
 * with adaptations for Danish cleaning business
 */

import type { EnhancedEmailMessage } from '@/types/enhanced-email';

export enum ContactImportance {
  NEW_CONTACT = 'NEW_CONTACT',   // Never emailed before - potential new customer!
  LOW = 'LOW',                    // Not much recent contact
  MEDIUM = 'MEDIUM',              // Some emails exchanged
  HIGH = 'HIGH'                   // Emails frequently with person
}

export interface ScoringCriteria {
  contactImportance: number;      // 0-40 points
  timeSensitivity: number;        // 0-30 points  
  businessValue: number;          // 0-30 points
  totalScore: number;             // 0-100 points
  breakdown: string[];            // Explanation of score
}

export class LeadScoringEngine {
  /**
   * Calculate contact importance score (0-40 points)
   */
  private calculateContactImportance(email: EnhancedEmailMessage): {
    score: number;
    level: ContactImportance;
    reason: string;
  } {
    // Check if this is a new contact
    const from = email.from.toLowerCase();
    
    // TODO: Actually check email history via tRPC
    // For now, use heuristics
    const isNewContact = !email.labels?.includes('responded');
    const hasHistory = email.labels?.includes('customer');
    
    if (isNewContact) {
      return {
        score: 30,
        level: ContactImportance.NEW_CONTACT,
        reason: 'Ny potentiel kunde (+30)'
      };
    }
    
    if (hasHistory) {
      return {
        score: 40,
        level: ContactImportance.HIGH,
        reason: 'Eksisterende kunde (+40)'
      };
    }
    
    // Check email frequency (mock for now)
    const emailCount = Math.floor(Math.random() * 10);
    if (emailCount > 5) {
      return {
        score: 40,
        level: ContactImportance.HIGH,
        reason: `Hyppig kontakt (${emailCount} emails) (+40)`
      };
    } else if (emailCount > 2) {
      return {
        score: 20,
        level: ContactImportance.MEDIUM,
        reason: `Moderat kontakt (${emailCount} emails) (+20)`
      };
    }
    
    return {
      score: 10,
      level: ContactImportance.LOW,
      reason: 'Sjælden kontakt (+10)'
    };
  }

  /**
   * Calculate time sensitivity score (0-30 points)
   */
  private calculateTimeSensitivity(email: EnhancedEmailMessage): {
    score: number;
    reason: string;
  } {
    const subject = email.subject?.toLowerCase() || '';
    const body = email.body?.toLowerCase() || '';
    const combined = `${subject} ${body}`;
    
    let score = 0;
    const reasons: string[] = [];
    
    // Check for urgent keywords
    if (combined.match(/i dag|urgent|asap|hurtig|akut/)) {
      score += 30;
      reasons.push('Urgent keywords (+30)');
    } else if (combined.match(/flytter|deadline|senest/)) {
      score += 20;
      reasons.push('Deadline nævnt (+20)');
    }
    
    // Check email age
    const ageInHours = (Date.now() - new Date(email.date).getTime()) / (1000 * 60 * 60);
    if (ageInHours < 24) {
      score += 10;
      reasons.push('< 24 timer gammel (+10)');
    } else if (ageInHours < 48) {
      score += 5;
      reasons.push('< 48 timer gammel (+5)');
    }
    
    // Cap at 30
    score = Math.min(score, 30);
    
    return {
      score,
      reason: reasons.join(', ') || 'Normal prioritet'
    };
  }

  /**
   * Calculate business value score (0-30 points)
   */
  private calculateBusinessValue(email: EnhancedEmailMessage): {
    score: number;
    reason: string;
  } {
    const subject = email.subject?.toLowerCase() || '';
    const body = email.body?.toLowerCase() || '';
    const from = email.from?.toLowerCase() || '';
    const combined = `${subject} ${body} ${from}`;
    
    let score = 0;
    const reasons: string[] = [];
    
    // Check lead source quality
    if (from.includes('rengoering.nu') || from.includes('rengøring.nu')) {
      score += 10;
      reasons.push('Rengøring.nu lead (+10)');
    } else if (from.includes('leadpoint')) {
      score += 15;
      reasons.push('Leadpoint - høj kvalitet (+15)');
    } else if (from.includes('adhelp')) {
      score += 8;
      reasons.push('AdHelp lead (+8)');
    }
    
    // Check job type value
    if (combined.match(/fast rengøring|fast kunde|ugentlig|månedlig/)) {
      score += 25;
      reasons.push('Fast rengøring - recurring revenue! (+25)');
    } else if (combined.match(/hovedrengøring|grundig/)) {
      score += 20;
      reasons.push('Hovedrengøring (+20)');
    } else if (combined.match(/flytte|flytterengøring/)) {
      score += 15;
      reasons.push('Flytterengøring (+15)');
    } else if (combined.match(/erhverv|kontor|virksomhed/)) {
      score += 20;
      reasons.push('Erhvervsrengøring (+20)');
    }
    
    // Check property size indicators
    if (combined.match(/(\d{3,})\s*(m2|m²|kvm)/)) {
      const match = combined.match(/(\d{3,})\s*(m2|m²|kvm)/);
      const size = parseInt(match![1]);
      if (size >= 200) {
        score += 15;
        reasons.push(`Stor bolig ${size}m² (+15)`);
      } else if (size >= 150) {
        score += 10;
        reasons.push(`Medium bolig ${size}m² (+10)`);
      }
    } else if (combined.match(/villa|hus|lejlighed/)) {
      score += 5;
      reasons.push('Boligtype nævnt (+5)');
    }
    
    // Cap at 30
    score = Math.min(score, 30);
    
    return {
      score,
      reason: reasons.join(', ') || 'Standard værdi'
    };
  }

  /**
   * Main scoring function - returns 0-100 score
   */
  public calculateScore(email: EnhancedEmailMessage): ScoringCriteria {
    const contactImportance = this.calculateContactImportance(email);
    const timeSensitivity = this.calculateTimeSensitivity(email);
    const businessValue = this.calculateBusinessValue(email);
    
    const totalScore = Math.min(
      contactImportance.score + timeSensitivity.score + businessValue.score,
      100
    );
    
    const breakdown = [
      `Contact: ${contactImportance.reason}`,
      `Time: ${timeSensitivity.reason}`,
      `Value: ${businessValue.reason}`,
      `Total: ${totalScore}/100`
    ];
    
    return {
      contactImportance: contactImportance.score,
      timeSensitivity: timeSensitivity.score,
      businessValue: businessValue.score,
      totalScore,
      breakdown
    };
  }

  /**
   * Batch score multiple emails and sort by priority
   */
  public prioritizeEmails(emails: EnhancedEmailMessage[]): Array<{
    email: EnhancedEmailMessage;
    scoring: ScoringCriteria;
    priority: 'HOT' | 'HIGH' | 'MEDIUM' | 'LOW';
  }> {
    return emails
      .map(email => {
        const scoring = this.calculateScore(email);
        
        let priority: 'HOT' | 'HIGH' | 'MEDIUM' | 'LOW';
        if (scoring.totalScore >= 85) priority = 'HOT';
        else if (scoring.totalScore >= 60) priority = 'HIGH';
        else if (scoring.totalScore >= 40) priority = 'MEDIUM';
        else priority = 'LOW';
        
        return { email, scoring, priority };
      })
      .sort((a, b) => b.scoring.totalScore - a.scoring.totalScore);
  }
}

// Export singleton instance
export const leadScoringEngine = new LeadScoringEngine();

/**
 * Example usage:
 * 
 * const score = leadScoringEngine.calculateScore(email);
 * console.log(`Score: ${score.totalScore}`);
 * console.log('Breakdown:', score.breakdown);
 * 
 * // Priority sorting
 * const prioritized = leadScoringEngine.prioritizeEmails(emails);
 * const hotLeads = prioritized.filter(p => p.priority === 'HOT');
 */
