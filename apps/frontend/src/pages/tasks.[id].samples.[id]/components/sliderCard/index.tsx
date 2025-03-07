import { useParams } from 'react-router';
import { VideoCard, AudioCard } from '@labelu/components-react';
import { useTranslation } from '@labelu/i18n';
import { useMemo } from 'react';

import type { SampleResponse } from '@/api/types';
import { MediaType } from '@/api/types';
import { ReactComponent as CheckSvgIcon } from '@/assets/svg/check.svg';
import { getThumbnailUrl } from '@/utils';
import type { TaskCollaboratorInWs } from '@/hooks/useTaskWs';
import useMe from '@/hooks/useMe';
import { UserAvatar } from '@/components/UserAvatar';

import { CheckBg, Triangle, ContentWrapper, IdWrapper, SkipWrapper, ImageWrapper, AnnotatingUser } from './style';

function CheckIcon() {
  return (
    <CheckBg>
      <Triangle />
      <CheckSvgIcon />
    </CheckBg>
  );
}

interface SliderCardProps {
  cardInfo: SampleResponse;
  type?: MediaType;
  index?: number;
  onClick: (sample: SampleResponse) => void;
  editingUser?: TaskCollaboratorInWs;
}

const SliderCard = ({ type, cardInfo, editingUser, index, onClick }: SliderCardProps) => {
  const { id, inner_id, state, file } = cardInfo;
  const filename = file.filename;
  const url = file.url;
  const routeParams = useParams();
  const sampleId = +routeParams.sampleId!;
  const { t } = useTranslation();
  const me = useMe();
  const isMeTheCurrentEditingUser = editingUser?.user_id === me?.data?.id;

  const userBlock = useMemo(() => {
    if (!isMeTheCurrentEditingUser && editingUser) {
      return (
        <AnnotatingUser>
          <UserAvatar user={editingUser} /> <span className="annotating-text">{t('isAnnotating')}</span>
        </AnnotatingUser>
      );
    }

    return null;
  }, [editingUser, isMeTheCurrentEditingUser, t]);

  const handleOnClick = (sample: SampleResponse) => {
    if (sample.id === sampleId) {
      return;
    }

    onClick(sample);
  };

  if (type === MediaType.AUDIO) {
    return (
      <ImageWrapper items="stretch">
        <AudioCard
          src={url!}
          active={id === sampleId}
          onClick={() => handleOnClick(cardInfo)}
          title={filename.substring(9)}
          no={index! + 1}
          showNo
          completed={state === 'DONE'}
          skipped={state === 'SKIPPED'}
        />
      </ImageWrapper>
    );
  }

  if (type === MediaType.VIDEO) {
    return (
      <ImageWrapper>
        {userBlock}

        <VideoCard
          src={url!}
          title={inner_id}
          active={id === sampleId}
          onClick={() => handleOnClick(cardInfo)}
          showPlayIcon
          showDuration
          completed={state === 'DONE'}
          skipped={state === 'SKIPPED'}
        />
      </ImageWrapper>
    );
  }

  const thumbnail = getThumbnailUrl(url!);

  return (
    <ImageWrapper items="center" flex="column" justify="center">
      {userBlock}
      <ContentWrapper
        flex="column"
        items="center"
        justify="center"
        active={id === sampleId}
        onClick={() => handleOnClick(cardInfo)}
      >
        {type === MediaType.IMAGE && <img src={thumbnail} alt="" />}
        {state === 'DONE' && <CheckIcon />}
        {state === 'SKIPPED' && <SkipWrapper>{t('skipped')}</SkipWrapper>}
      </ContentWrapper>
      <IdWrapper>{inner_id}</IdWrapper>
    </ImageWrapper>
  );
};
export default SliderCard;
