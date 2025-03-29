<script>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import bridgeApi from '@/composables/bridge/bridge.price.api';
import useNotifications from '@/composables/useNotifications';

export default {
  name: 'TokenImageUpload',
  props: {
    logoUrl: {
      type: String,
      default: '',
    },
  },
  emits: ['update:logoUrl'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { addNotification } = useNotifications();

    const uploading = ref(false);
    const previewUrl = ref(props.logoUrl || '');
    const fileInput = ref(null);

    // For temporarily storing local preview before successful upload
    const tempPreviewUrl = ref('');

    // Watch for changes in the logoUrl prop to keep previewUrl in sync
    watch(
      () => props.logoUrl,
      newValue => {
        previewUrl.value = newValue || '';
      }
    );

    // Check if there's already an image
    const hasImage = computed(() => {
      return !!previewUrl.value;
    });

    // Accept only image files
    const acceptedFileTypes = 'image/png, image/jpeg, image/jpg, image/gif';

    // Open file browser
    const openFileBrowser = () => {
      if (fileInput.value) {
        fileInput.value.click();
      }
    };

    // Handle file selection
    const onFileSelected = async event => {
      const file = event.target.files[0];
      if (!file) return;

      // Check file type
      if (
        !file.type.match(
          acceptedFileTypes.replace(/\s/g, '').split(',').join('|')
        )
      ) {
        addNotification({
          type: 'error',
          title: '',
          message: 'Invalid file type. Please upload an image file.',
        });
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addNotification({
          type: 'error',
          title: '',
          message: 'File size exceeds 5MB limit.',
        });
        return;
      }

      try {
        uploading.value = true;

        // Create temporary local preview but don't set it to previewUrl yet
        const reader = new FileReader();
        reader.onload = e => {
          tempPreviewUrl.value = e.target.result;
        };
        reader.readAsDataURL(file);

        // Upload to server
        const response = await bridgeApi.uploadImage(file);

        console.log('Upload response:', response);

        if (response && response.url) {
          // Only update the preview URL after successful API upload
          previewUrl.value = response.url;
          emit('update:logoUrl', response.url);

          addNotification({
            type: 'success',
            title: '',
            message: 'Image uploaded successfully',
          });
        } else {
          throw new Error('Failed to get image URL from server');
        }
      } catch (error) {
        console.error('Error uploading image:', error);

        // Reset previewUrl if there was an error
        // This ensures we don't show a broken preview
        tempPreviewUrl.value = '';

        addNotification({
          type: 'error',
          title: '',
          message:
            error.response?.data?.message ||
            error.message ||
            'Failed to upload image',
        });
      } finally {
        uploading.value = false;
        // Reset file input to allow re-uploading the same file
        if (fileInput.value) {
          fileInput.value.value = '';
        }
      }
    };

    // Remove the current image
    const removeImage = () => {
      previewUrl.value = '';
      tempPreviewUrl.value = '';
      emit('update:logoUrl', '');
      // Reset file input to allow re-uploading the same file
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    return {
      uploading,
      previewUrl,
      tempPreviewUrl,
      fileInput,
      hasImage,
      acceptedFileTypes,
      openFileBrowser,
      onFileSelected,
      removeImage,
    };
  },
};
</script>

<template>
  <div class="token-image-upload">
    <p class="mb-2 text-base font-bold">Token Logo</p>

    <div class="relative w-full">
      <!-- Hidden file input -->
      <input
        ref="fileInput"
        type="file"
        :accept="acceptedFileTypes"
        class="hidden"
        @change="onFileSelected"
      />

      <!-- Preview area - only show if we have a valid uploaded image URL -->
      <div
        v-if="hasImage"
        class="flex overflow-hidden relative justify-center items-center mb-2 w-24 h-24 rounded-lg border border-gray-300 cursor-pointer"
        @click="openFileBrowser"
      >
        <img
          :src="previewUrl"
          alt="Token logo"
          class="object-contain max-w-full max-h-full"
        />
        <div
          class="flex absolute inset-0 justify-center items-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity"
        >
          <span class="text-white opacity-0 hover:opacity-100">Change</span>
        </div>
        <button
          class="absolute top-0 right-0 p-1 text-white bg-red-500 rounded-bl-lg"
          @click.stop.prevent="removeImage"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Upload button -->
      <div v-else class="mb-2">
        <BalBtn
          color="gray"
          :outline="true"
          :loading="uploading"
          :disabled="uploading"
          class="py-2 px-4 !h-auto"
          @click="openFileBrowser"
        >
          <div class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="mr-2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload token logo
          </div>
        </BalBtn>
      </div>

      <p class="text-xs text-gray-500">
        Recommended: PNG or JPG. Max size: 5MB
      </p>
    </div>
  </div>
</template>

<style scoped>
.token-image-upload {
  margin-bottom: 16px;
}
</style> 