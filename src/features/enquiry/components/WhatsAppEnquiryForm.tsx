import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/common/Modal';
import './WhatsAppEnquiryForm.css';

interface WhatsAppEnquiryFormProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
  schoolName?: string;
}

interface FormData {
  parentName: string;
  name: string;
  class: string;
  age: string;
  contact: string;
  message?: string;
}

const WhatsAppEnquiryForm: React.FC<WhatsAppEnquiryFormProps> = ({
  isOpen,
  onClose,
  whatsappNumber,
  schoolName = 'MapleKids Play School'
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    parentName: '',
    name: '',
    class: '',
    age: '',
    contact: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateWhatsAppMessage = (data: FormData) => {
    const message = `Hello! I'm interested in enrolling my child at ${schoolName}.

*Parent Details:*
• Parent Name: ${data.parentName}

*Child Details:*
• Name: ${data.name}
• Class: ${data.class}
• Age: ${data.age}
• Contact: ${data.contact}

${data.message ? `*Additional Message:*\n${data.message}` : ''}

Please provide me with more information about admission process and fees.

Thank you!`;

    return encodeURIComponent(message);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.parentName.trim() || !formData.name.trim() || !formData.class.trim() || !formData.age.trim() || !formData.contact.trim()) {
      alert(t('whatsappEnquiry.form.validation.fillAllFields'));
      return;
    }

    // Phone number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.contact.replace(/\D/g, ''))) {
      alert(t('whatsappEnquiry.form.validation.invalidPhone'));
      return;
    }

    setIsSubmitting(true);

    try {
      const message = generateWhatsAppMessage(formData);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
      
      // Reset form
      setFormData({
        parentName: '',
        name: '',
        class: '',
        age: '',
        contact: '',
        message: ''
      });
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        setIsSubmitting(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      alert(t('common.error') + ': Unable to open WhatsApp. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('whatsappEnquiry.title')}
      className="whatsapp-enquiry-modal"
    >
      <div className="whatsapp-enquiry-container">
        <div className="whatsapp-header">
          <h3>{t('whatsappEnquiry.header.title')}</h3>
          <p>{t('whatsappEnquiry.header.description')}</p>
        </div>

        <form onSubmit={handleSubmit} className="whatsapp-form">
          <div className="form-group">
            <label htmlFor="parentName">{t('whatsappEnquiry.form.parentName')} *</label>
            <input
              type="text"
              id="parentName"
              name="parentName"
              value={formData.parentName}
              onChange={handleInputChange}
              placeholder={t('whatsappEnquiry.form.parentNamePlaceholder')}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">{t('whatsappEnquiry.form.childName')} *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('whatsappEnquiry.form.childNamePlaceholder')}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="class">{t('whatsappEnquiry.form.class')} *</label>
              <input
                type="text"
                id="class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                placeholder={t('whatsappEnquiry.form.classPlaceholder')}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">{t('whatsappEnquiry.form.age')} *</label>
              <input
                type="text"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder={t('whatsappEnquiry.form.agePlaceholder')}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contact">{t('whatsappEnquiry.form.contact')} *</label>
              <input
                type="tel"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                placeholder={t('whatsappEnquiry.form.contactPlaceholder')}
                required
                disabled={isSubmitting}
                maxLength={10}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message">{t('whatsappEnquiry.form.message')}</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder={t('whatsappEnquiry.form.messagePlaceholder')}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              {t('whatsappEnquiry.buttons.cancel')}
            </button>
            <button
              type="submit"
              className="btn-whatsapp"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  {t('whatsappEnquiry.buttons.openingWhatsApp')}
                </>
              ) : (
                <>
                  <span className="whatsapp-icon-small">📱</span>
                  {t('whatsappEnquiry.buttons.sendWhatsApp')}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="whatsapp-info">
          <p><strong>{t('common.note', { defaultValue: 'Note' })}:</strong> {t('whatsappEnquiry.info.note')}</p>
        </div>
      </div>
    </Modal>
  );
};

export default WhatsAppEnquiryForm;
