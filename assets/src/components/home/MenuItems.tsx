import React, {useEffect} from 'react';
import {NavLink} from 'react-router-dom';
import {useAuth} from 'src/components/auth/AuthProvider';
import {
  TrashOutline,
  BookmarkOutline,
  PauseOutline,
  StatusOfflineOutline,
  PencilOutline,
  TagOutline,
  LightBulbOutline,
  ArchiveOutline,
} from '@graywolfai/react-heroicons';
import {useGlobal} from 'src/components/global/GlobalProvider';
import {Tag} from 'src/libs/types';

type MenuProps = {
  routes: Array<any>;
  setShowTagModal: (b: boolean) => void;
};

type MenuItemProps = React.PropsWithChildren<{link: string}>;

function MenuItem(props: MenuItemProps) {
  return (
    <div className="py-1">
      <NavLink
        className="flex items-end justify-start block px-6 py-3 text-gray-700 rounded-r-full cursor-pointer hover:bg-indigo-100 hover:text-indigo-700 focus:outline-none focus:bg-indigo-200"
        activeClassName="text-indigo-800 bg-indigo-200"
        to={props.link}
      >
        {props.children}
      </NavLink>
    </div>
  );
}

export default function MenuItems(props: MenuProps) {
  const auth = useAuth();
  const {fetchTags, tags} = useGlobal();
  const {setShowTagModal} = props;

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return (
    <>
      <MenuItem link={'/notes'}>
        <LightBulbOutline className="w-5 h-5 mr-2" /> Notes
      </MenuItem>

      <MenuItem link={'/bookmark'}>
        <BookmarkOutline className="w-5 h-5 mr-2" /> Bookmark
      </MenuItem>

      <div className="border-t border-gray-200"></div>

      {tags.map((tag: Tag) => (
        <MenuItem link={`/tag/${tag.id}`} key={tag.id}>
          <TagOutline className="flex-shrink-0 w-5 h-5 mr-2" />
          <div
            className="overflow-hidden overflow-ellipsis whitespace-nowrap"
            title={tag.name}
          >
            {tag.name}
          </div>
        </MenuItem>
      ))}

      <div className="py-1">
        <span
          className="flex items-end justify-start block px-6 py-3 text-gray-700 rounded-r-full cursor-pointer hover:bg-gray-100 hover:text-indigo-700 focus:outline-none focus:bg-indigo-200"
          role="menuitem"
          onClick={() => {
            setShowTagModal(true);
          }}
        >
          <PencilOutline className="w-5 h-5 mr-2" /> Edit tags
        </span>
      </div>

      <div className="border-t border-gray-200"></div>

      <MenuItem link={'/suspend'}>
        <PauseOutline className="w-5 h-5 mr-2" /> Suspend
      </MenuItem>
      <MenuItem link={'/bury'}>
        <StatusOfflineOutline className="w-5 h-5 mr-2" /> Bury
      </MenuItem>
      <MenuItem link={'/archive'}>
        <ArchiveOutline className="w-5 h-5 mr-2" /> Archive
      </MenuItem>
      <MenuItem link={'/trash'}>
        <TrashOutline className="w-5 h-5 mr-2" /> Trash
      </MenuItem>

      <div className="border-t border-gray-200"></div>

      {props.routes &&
        props.routes.map((route) => {
          return (
            <MenuItem link={route.path} key={route.path}>
              {route.name}
            </MenuItem>
          );
        })}

      <div className="border-t border-gray-200"></div>

      <div className="py-1 pb-2">
        <span
          className="flex items-end justify-start block px-6 py-3 text-gray-700 rounded-r-full cursor-pointer hover:bg-gray-100 hover:text-indigo-700 focus:outline-none focus:bg-indigo-200"
          role="menuitem"
          onClick={auth.logout}
        >
          Sign out
        </span>
      </div>
    </>
  );
}
